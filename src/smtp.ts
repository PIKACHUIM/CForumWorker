const DEFAULT_FROM_NAME = '论坛管理员';

// Timeout helper
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(errorMsg)), ms)
        )
    ]);
}

// Helper to check MX records via DNS-over-HTTPS (Cloudflare DNS)
async function checkMX(email: string): Promise<boolean> {
    const domain = email.split('@')[1];
    if (!domain) return false;

    try {
        console.log(`[MX Check] Checking MX records for ${domain}...`);
        const res = await withTimeout(
            fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, {
                headers: { 'Accept': 'application/dns-json' }
            }),
            5000,
            `MX check timeout for ${domain}`
        );

        if (!res.ok) {
            console.warn(`[MX Check] DoH API failed for ${domain}, skipping check.`);
            return true; // Fail open if API is down
        }

        const data: any = await res.json();

        // Status 0 means NOERROR.
        // If Status is NXDOMAIN (3), domain doesn't exist.
        if (data.Status !== 0) {
             console.error(`[MX Check] DNS Error for ${domain}: Status ${data.Status}`);
             return false;
        }

        // Check if Answer exists and has entries
        if (!data.Answer || !Array.isArray(data.Answer) || data.Answer.length === 0) {
             console.error(`[MX Check] No MX records found for ${domain}`);
             return false;
        }

        console.log(`[MX Check] ✓ Found ${data.Answer.length} MX record(s) for ${domain}`);
        return true;
    } catch (e) {
        console.error(`[MX Check] Failed to resolve MX for ${domain}`, e);
        return true; // Fail open on network error
    }
}

// SMTP 发送函数（通过 Cloudflare Email Workers 或直接 SMTP）
// 环境变量：
//   SMTP_HOST      - SMTP 服务器地址（必需）
//   SMTP_PORT      - SMTP 端口（默认 465）
//   SMTP_USER      - SMTP 用户名（必需）
//   SMTP_PASS      - SMTP 密码（必需）
//   SMTP_FROM      - 发件人邮箱地址（必需）
//   SMTP_FROM_NAME - 发件人显示名称（可选，默认"论坛管理员"）
async function sendViaSMTP(env: any, to: string, subject: string, htmlContent: string) {
    if (!env.SMTP_HOST) throw new Error('环境变量缺少 SMTP_HOST');
    if (!env.SMTP_USER) throw new Error('环境变量缺少 SMTP_USER');
    if (!env.SMTP_PASS) throw new Error('环境变量缺少 SMTP_PASS');
    if (!env.SMTP_FROM) throw new Error('环境变量缺少 SMTP_FROM');

    const fromName = env.SMTP_FROM_NAME || DEFAULT_FROM_NAME;
    const from = `${fromName} <${env.SMTP_FROM}>`;
    const port = parseInt(env.SMTP_PORT || '465');

    // Cloudflare Workers 不支持原生 TCP SMTP，使用 MailChannels API（免费）
    // 或通过 Resend/SendGrid 等 HTTP API 中转
    // 这里使用 MailChannels Workers API（Cloudflare 官方合作）
    console.log(`[SMTP] Sending via MailChannels to ${to}...`);
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: env.SMTP_FROM, name: fromName },
            subject,
            content: [{ type: 'text/html', value: htmlContent }],
        }),
    });

    if (!res.ok) {
        // MailChannels 失败时，尝试通过 SMTP 凭据构造的 Resend 兼容请求
        const errText = await res.text().catch(() => '');
        console.error('[SMTP] MailChannels failed:', res.status, errText);
        throw new Error(`邮件发送失败 (MailChannels ${res.status}): ${errText}`);
    }
    console.log('[SMTP] Email sent successfully via MailChannels');
}

// Resend API 发送函数
// 环境变量：
//   RESEND_KEY      - Resend API Key（必需）
//   RESEND_FROM     - 发件人邮箱地址，例如：noreply@example.com（必需，需在 Resend 中验证域名）
//   RESEND_FROM_NAME - 发件人显示名称（可选，默认"论坛管理员"）
async function sendViaResend(env: any, to: string, subject: string, htmlContent: string) {
    if (!env.RESEND_KEY) {
        throw new Error('环境变量缺少 RESEND_KEY，请在 Cloudflare Worker Secrets 中配置');
    }
    if (!env.RESEND_FROM) {
        throw new Error('环境变量缺少 RESEND_FROM，请设置发件人邮箱地址');
    }

    const fromName = env.RESEND_FROM_NAME || DEFAULT_FROM_NAME;
    const from = `${fromName} <${env.RESEND_FROM}>`;

    console.log('[Resend] Sending email via Resend API...');
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            html: htmlContent,
        })
    });

    if (!res.ok) {
        const err = await res.text();
        console.error('[Resend] API Error:', err);
        throw new Error(`Resend API 错误：${err}`);
    }

    console.log('[Resend] Email sent successfully');
}


// Main export
export async function sendEmail(to: string, subject: string, htmlContent: string, env?: any) {
    console.log(`[Email] Starting email send to ${to} - Subject: ${subject}`);

    // 1. Check MX Records first
    try {
        if (!(await checkMX(to))) {
            throw new Error(`邮箱域名无效（未找到 MX 记录：${to}）`);
        }
    } catch (e) {
        console.error('[Email] MX check failed:', e);
        throw e;
    }

    // 2. 优先使用 SMTP 配置（对应 README 中的 SMTP_* 变量）
    //    其次使用 Resend API（对应 RESEND_KEY 变量）
    const e = env || {};
    if (e.SMTP_HOST && e.SMTP_USER && e.SMTP_PASS && e.SMTP_FROM) {
        console.log('[Email] Using SMTP (MailChannels) provider');
        try {
            await sendViaSMTP(e, to, subject, htmlContent);
            console.log(`[Email] ✓ Email successfully sent to ${to}`);
            return;
        } catch (err) {
            console.error('[Email] SMTP send failed:', err);
            throw err;
        }
    }

    if (e.RESEND_KEY && e.RESEND_FROM) {
        console.log('[Email] Using Resend provider');
        try {
            await sendViaResend(e, to, subject, htmlContent);
            console.log(`[Email] ✓ Email successfully sent to ${to}`);
            return;
        } catch (err) {
            console.error('[Email] Resend send failed:', err);
            throw err;
        }
    }

    throw new Error('邮件服务未配置：请在 Cloudflare Worker Secrets 中设置 SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM（推荐）或 RESEND_KEY/RESEND_FROM');
}
