import * as React from 'react';

import { TurnstileWidget } from '@/components/turnstile';
import { AuthCard, AuthPageShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfig } from '@/hooks/use-config';
import { getSecurityHeaders } from '@/lib/api';

export function ResetPage() {
	const { config } = useConfig();
	const enabled = !!config?.turnstile_enabled;
	const siteKey = config?.turnstile_site_key || '';
	const turnstileActive = enabled && !!siteKey;

	const params = new URLSearchParams(window.location.search);
	const token = params.get('token') || '';

	const [password, setPassword] = React.useState('');
	const [totpCode, setTotpCode] = React.useState('');
	const [turnstileToken, setTurnstileToken] = React.useState('');
	const [turnstileResetKey, setTurnstileResetKey] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState('');
	const [success, setSuccess] = React.useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!token) return setError('缺少重置 token');
		if (turnstileActive && !turnstileToken) return setError('请完成验证码验证');
		setLoading(true);
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({
					token,
					new_password: password,
					totp_code: totpCode,
					'cf-turnstile-response': turnstileToken
				})
			});
			const data = (await res.json()) as any;
			if (!res.ok) {
				setTurnstileToken('');
				setTurnstileResetKey((v) => v + 1);
				throw new Error(data?.error || '重置失败');
			}
			setSuccess('密码重置成功，请重新登录。');
			setPassword('');
			setTotpCode('');
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
						<div className="text-4xl mb-3 animate-bounce-gentle">🔑</div>
						<h1 className="font-display text-2xl font-bold bg-gradient-to-r from-[#f43f8e] to-[#a855f7] bg-clip-text text-transparent">
							重置密码
						</h1>
						<p className="text-sm text-muted-foreground mt-1">设置你的新密码</p>
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
							<Label htmlFor="reset-password">新密码</Label>
							<Input
								id="reset-password"
								type="password"
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="reset-totp">双重验证码 <span className="text-muted-foreground text-xs">(若开启)</span></Label>
							<Input
								id="reset-totp"
								type="text"
								inputMode="numeric"
								maxLength={6}
								autoComplete="one-time-code"
								value={totpCode}
								onChange={(e) => setTotpCode(e.target.value)}
								placeholder="选填"
							/>
						</div>

						<TurnstileWidget enabled={turnstileActive} siteKey={siteKey} onToken={setTurnstileToken} resetKey={turnstileResetKey} />

						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? '🔑 处理中...' : '✨ 重置密码'}
						</Button>

						<div className="text-sm text-center pt-1">
							<a className="text-muted-foreground hover:text-primary transition-colors hover:underline" href="/login">
								返回登录
							</a>
						</div>
					</form>
				</div>
			</AuthCard>
		</AuthPageShell>
	);
}

