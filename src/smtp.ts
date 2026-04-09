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

    // 2. Send via Resend API
    try {
        await sendViaResend(env || {}, to, subject, htmlContent);
        console.log(`[Email] ✓ Email successfully sent to ${to}`);
    } catch (e) {
        console.error('[Email] Failed to send email:', e);
        throw e;
    }
}
