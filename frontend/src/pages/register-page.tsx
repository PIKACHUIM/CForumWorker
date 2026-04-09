import * as React from 'react';

import { TurnstileWidget } from '@/components/turnstile';
import { AuthCard, AuthPageShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/hooks/use-config';
import { useI18n } from '@/hooks/use-i18n';
import { getSecurityHeaders } from '@/lib/api';

// 默认用户协议
const DEFAULT_TERMS = `用户协议

欢迎使用本论坛（以下简称"本站"）。在注册账号前，请仔细阅读以下条款：

1. 账号注册
   - 您需要提供真实有效的邮箱地址完成注册。
   - 您有责任保管好自己的账号和密码，不得将账号转让或出借给他人。

2. 用户行为规范
   - 禁止发布违法、违规、侵权、色情、暴力等内容。
   - 禁止发布垃圾广告、恶意链接等内容。
   - 禁止骚扰、攻击其他用户。
   - 请尊重他人，文明交流。

3. 内容版权
   - 您在本站发布的内容，版权归您所有，但您授权本站展示和传播。
   - 请勿发布侵犯他人版权的内容。

4. 账号处理
   - 违反本协议的账号将被封禁或删除。
   - 本站有权在不通知的情况下删除违规内容。

5. 免责声明
   - 本站不对用户发布的内容承担法律责任。
   - 本站保留随时修改本协议的权利。

继续注册即表示您同意以上条款。`;

// 默认隐私政策
const DEFAULT_PRIVACY = `隐私政策

本站重视您的隐私保护，请仔细阅读以下隐私政策：

1. 信息收集
   - 注册时我们收集您的邮箱地址和用户名。
   - 使用过程中我们记录您发布的帖子和评论。
   - 我们可能记录您的 IP 地址用于安全防护。

2. 信息使用
   - 您的邮箱用于账号验证和重要通知。
   - 我们不会将您的个人信息出售给第三方。
   - 我们可能使用匿名化数据改善服务。

3. 信息安全
   - 您的密码经过加密存储，我们无法查看明文密码。
   - 我们采取合理的技术措施保护您的数据安全。

4. Cookie
   - 本站使用 Cookie 保持您的登录状态。
   - 您可以在浏览器中禁用 Cookie，但这可能影响部分功能。

5. 数据删除
   - 您可以随时申请删除您的账号和相关数据。
   - 删除后数据将无法恢复。

6. 政策更新
   - 本站保留随时更新隐私政策的权利。
   - 重大变更将通过邮件通知您。

使用本站即表示您同意本隐私政策。`;

// 协议弹窗组件
function PolicyModal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
	const { t } = useI18n();
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 w-full max-w-lg max-h-[70vh] flex flex-col rounded-2xl border border-sakura/30 bg-background shadow-2xl">
				<div className="flex items-center justify-between px-5 py-4 border-b border-sakura/20 bg-gradient-to-r from-sakura/10 to-lavender/10 rounded-t-2xl">
					<h3 className="font-display font-bold text-base">{title}</h3>
					<button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">✕</button>
				</div>
				<div className="overflow-y-auto flex-1 p-5">
					<pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">{content}</pre>
				</div>
				<div className="px-5 py-3 border-t border-sakura/20">
					<Button size="sm" className="w-full" onClick={onClose}>{t.iHaveRead}</Button>
				</div>
			</div>
		</div>
	);
}

export function RegisterPage() {
	const { config } = useConfig();
	const { t } = useI18n();
	const [email, setEmail] = React.useState('');
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [turnstileToken, setTurnstileToken] = React.useState('');
	const [turnstileResetKey, setTurnstileResetKey] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState('');
	const [success, setSuccess] = React.useState('');
	const [agreeTerms, setAgreeTerms] = React.useState(false);
	const [agreePrivacy, setAgreePrivacy] = React.useState(false);
	const [showTerms, setShowTerms] = React.useState(false);
	const [showPrivacy, setShowPrivacy] = React.useState(false);

	const enabled = !!config?.turnstile_enabled;
	const siteKey = config?.turnstile_site_key || '';
	const turnstileActive = enabled && !!siteKey;

	const termsContent = config?.site_terms || DEFAULT_TERMS;
	const privacyContent = config?.site_privacy || DEFAULT_PRIVACY;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!agreeTerms || !agreePrivacy) {
			setError(t.mustAgree);
			return;
		}
		if (turnstileActive && !turnstileToken) {
			setError(t.completeCaptcha);
			return;
		}

		setLoading(true);
		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({
					email,
					username,
					password,
					'cf-turnstile-response': turnstileToken
				})
			});
			const data = (await res.json()) as any;
			if (!res.ok) {
				setTurnstileToken('');
				setTurnstileResetKey((v) => v + 1);
				throw new Error(data?.error || t.registerFailed);
			}
			setSuccess(t.registerSuccess);
			setEmail('');
			setUsername('');
			setPassword('');
			setTurnstileToken('');
			setTurnstileResetKey((v) => v + 1);
		} catch (err: any) {
			setError(String(err?.message || err));
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthPageShell>
		{showTerms && <PolicyModal title={t.termsTitle} content={termsContent} onClose={() => setShowTerms(false)} />}
		{showPrivacy && <PolicyModal title={t.privacyTitle} content={privacyContent} onClose={() => setShowPrivacy(false)} />}

			<AuthCard>
				<div className="p-8">
					{/* 标题 */}
					<div className="text-center mb-8">
						<div className="text-4xl mb-3 animate-bounce-gentle">✨</div>
					<h1 className="font-display text-2xl font-bold bg-gradient-to-r from-[#f43f8e] to-[#a855f7] bg-clip-text text-transparent">
						{t.joinUs}
					</h1>
					<p className="text-sm text-muted-foreground mt-1">{t.registerSubtitle}</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{error ? (
							<div className="rounded-xl border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
								{error}
							</div>
						) : null}
						{success ? (
							<div className="rounded-xl border border-mint/50 bg-mint/10 p-3 text-sm text-green-700 dark:text-green-300">
								🎉 {success}
							</div>
						) : null}

					<div className="space-y-2">
						<Label htmlFor="register-username">{t.username} <span className="text-muted-foreground text-xs">{t.usernameMaxLen}</span></Label>
						<Input
							id="register-username"
							name="username"
							type="text"
							maxLength={20}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder={t.nickname}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="register-email">{t.email}</Label>
							<Input
								id="register-email"
								name="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								required
							/>
						</div>

					<div className="space-y-2">
						<Label htmlFor="register-password">{t.password} <span className="text-muted-foreground text-xs">{t.passwordLen}</span></Label>
							<Input
								id="register-password"
								name="password"
								type="password"
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>

					{/* 用户协议勾选 */}
					<div className="space-y-3 rounded-xl border border-sakura/20 bg-sakura/5 p-3">
						<label className="flex items-start gap-2.5 cursor-pointer group">
							<input
								type="checkbox"
								className="mt-0.5 h-4 w-4 rounded border-sakura/40 accent-pink-500 cursor-pointer"
								checked={agreeTerms}
								onChange={(e) => setAgreeTerms(e.target.checked)}
							/>
							<span className="text-sm text-muted-foreground leading-relaxed">
								{t.agreeTerms}{' '}
								<button
									type="button"
									className="text-primary hover:underline font-medium"
									onClick={() => setShowTerms(true)}
								>
									{t.termsLink}
								</button>
							</span>
						</label>
						<label className="flex items-start gap-2.5 cursor-pointer group">
							<input
								type="checkbox"
								className="mt-0.5 h-4 w-4 rounded border-sakura/40 accent-pink-500 cursor-pointer"
								checked={agreePrivacy}
								onChange={(e) => setAgreePrivacy(e.target.checked)}
							/>
							<span className="text-sm text-muted-foreground leading-relaxed">
								{t.agreeTerms}{' '}
								<button
									type="button"
									className="text-primary hover:underline font-medium"
									onClick={() => setShowPrivacy(true)}
								>
									{t.privacyLink}
								</button>
							</span>
						</label>
					</div>

						<TurnstileWidget enabled={turnstileActive} siteKey={siteKey} onToken={setTurnstileToken} resetKey={turnstileResetKey} />

					<Button
						className="w-full"
						type="submit"
						disabled={loading || !agreeTerms || !agreePrivacy}
					>
						{loading ? t.registering : t.registerBtn}
					</Button>

					<div className="text-sm text-center pt-1">
						<a className="text-muted-foreground hover:text-primary transition-colors hover:underline" href="/login">
							{t.hasAccount}
						</a>
					</div>
					</form>
				</div>
			</AuthCard>
		</AuthPageShell>
	);
}
