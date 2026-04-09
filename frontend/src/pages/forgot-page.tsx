import * as React from 'react';

import { TurnstileWidget } from '@/components/turnstile';
import { AuthCard, AuthPageShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/hooks/use-config';
import { useI18n } from '@/hooks/use-i18n';
import { getSecurityHeaders } from '@/lib/api';

export function ForgotPage() {
	const { config } = useConfig();
	const { t } = useI18n();
	const enabled = !!config?.turnstile_enabled;
	const siteKey = config?.turnstile_site_key || '';
	const turnstileActive = enabled && !!siteKey;

	const [email, setEmail] = React.useState('');
	const [turnstileToken, setTurnstileToken] = React.useState('');
	const [turnstileResetKey, setTurnstileResetKey] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState('');
	const [success, setSuccess] = React.useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (turnstileActive && !turnstileToken) return setError(t.completeCaptcha);
		setLoading(true);
		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({ email, 'cf-turnstile-response': turnstileToken })
			});
			const data = (await res.json()) as any;
			if (!res.ok) {
				setTurnstileToken('');
				setTurnstileResetKey((v) => v + 1);
				throw new Error(data?.error || t.sendFailed);
			}
			setSuccess(t.resetEmailSent);
			setEmail('');
			setTurnstileToken('');
			setTurnstileResetKey((v) => v + 1);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthPageShell>
			<AuthCard>
				<div className="p-8">
					<div className="text-center mb-8">
						<div className="text-4xl mb-3 animate-bounce-gentle">💌</div>
				<h1 className="font-display text-2xl font-bold bg-gradient-to-r from-[#f43f8e] to-[#a855f7] bg-clip-text text-transparent">
					{t.forgotPasswordTitle}
				</h1>
				<p className="text-sm text-muted-foreground mt-1">{t.forgotSubtitle}</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{error ? (
							<div className="rounded-xl border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
								{error}
							</div>
						) : null}
						{success ? (
							<div className="rounded-xl border border-mint/50 bg-mint/10 p-3 text-sm text-green-700 dark:text-green-300">
								📬 {success}
							</div>
						) : null}

				<div className="space-y-2">
					<Label htmlFor="forgot-email">{t.email}</Label>
							<Input
								id="forgot-email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								required
							/>
						</div>

						<TurnstileWidget enabled={turnstileActive} siteKey={siteKey} onToken={setTurnstileToken} resetKey={turnstileResetKey} />

				<Button className="w-full" type="submit" disabled={loading}>
					{loading ? t.sending : t.sendReset}
				</Button>

				<div className="text-sm text-center pt-1">
					<a className="text-muted-foreground hover:text-primary transition-colors hover:underline" href="/login">
						{t.backToLogin}
					</a>
				</div>
					</form>
				</div>
			</AuthCard>
		</AuthPageShell>
	);
}

