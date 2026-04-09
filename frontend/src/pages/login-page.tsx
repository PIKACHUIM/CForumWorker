import * as React from 'react';

import { TurnstileWidget } from '@/components/turnstile';
import { AuthCard, AuthPageShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/hooks/use-config';
import { useI18n } from '@/hooks/use-i18n';
import { getSecurityHeaders } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';

export function LoginPage() {
	const { config } = useConfig();
	const { t } = useI18n();
	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [totpCode, setTotpCode] = React.useState('');
	const [turnstileToken, setTurnstileToken] = React.useState('');
	const [turnstileResetKey, setTurnstileResetKey] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState('');

	const enabled = !!config?.turnstile_enabled;
	const siteKey = config?.turnstile_site_key || '';
	const turnstileActive = enabled && !!siteKey;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		if (turnstileActive && !turnstileToken) {
			setError(t.completeCaptcha);
			return;
		}
		setLoading(true);
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({
					email,
					password,
					totp_code: totpCode,
					'cf-turnstile-response': turnstileToken
				})
			});
			const data = (await res.json()) as any;
			if (!res.ok) {
				setTurnstileToken('');
				setTurnstileResetKey((v) => v + 1);
				if (data?.error === 'TOTP_REQUIRED') {
					setError(t.twoFARequired);
					return;
				}
				throw new Error(data?.error || t.loginFailed);
			}

			setUser(data.user);
			setToken(data.token);
			window.location.href = '/';
		} catch (err: any) {
			setError(String(err?.message || err));
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthPageShell>
			<AuthCard>
				<div className="p-8">
					{/* 标题 */}
					<div className="text-center mb-8">
						<div className="text-4xl mb-3 animate-bounce-gentle">🌸</div>
						<h1 className="font-display text-2xl font-bold bg-gradient-to-r from-[#f43f8e] to-[#a855f7] bg-clip-text text-transparent">
							{t.welcomeBack}
						</h1>
						<p className="text-sm text-muted-foreground mt-1">{t.loginSubtitle}</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{error ? (
							<div className="rounded-xl border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
								{error}
							</div>
						) : null}

						<div className="space-y-2">
							<Label htmlFor="login-email">{t.email}</Label>
							<Input
								id="login-email"
								name="email"
								type="email"
								autoComplete="username"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="login-password">{t.password}</Label>
							<Input
								id="login-password"
								name="password"
								type="password"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="login-totp">{t.twoFACode} <span className="text-muted-foreground text-xs">{t.twoFAOptional}</span></Label>
							<Input
								id="login-totp"
								name="totp_code"
								type="text"
								inputMode="numeric"
								pattern="\d*"
								maxLength={6}
								placeholder={t.optional}
								autoComplete="one-time-code"
								value={totpCode}
								onChange={(e) => setTotpCode(e.target.value)}
							/>
						</div>

						<TurnstileWidget enabled={turnstileActive} siteKey={siteKey} onToken={setTurnstileToken} resetKey={turnstileResetKey} />

						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? t.loggingIn : t.loginBtn}
						</Button>

						<div className="flex justify-between text-sm pt-1">
							<a className="text-muted-foreground hover:text-primary transition-colors hover:underline" href="/register">
								{t.noAccount}
							</a>
							<a className="text-muted-foreground hover:text-primary transition-colors hover:underline" href="/forgot">
								{t.forgotPassword}
							</a>
						</div>
					</form>
				</div>
			</AuthCard>
		</AuthPageShell>
	);
}
