import * as React from 'react';

import QRCode from 'qrcode';

import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiFetch, getSecurityHeaders } from '@/lib/api';
import { getUser, logout, setUser, type User } from '@/lib/auth';
import { useI18n } from '@/hooks/use-i18n';

export function SettingsPage() {
	const [user, setUserState] = React.useState<User | null>(() => getUser());
	const { t } = useI18n();
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState('');

	const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar_url || '');
	const [emailNotifications, setEmailNotifications] = React.useState<boolean>(user?.email_notifications !== false);

	const [emailNew, setEmailNew] = React.useState('');
	const [emailTotp, setEmailTotp] = React.useState('');

	const [totpSecret, setTotpSecret] = React.useState('');
	const [totpUri, setTotpUri] = React.useState('');
	const [totpCode, setTotpCode] = React.useState('');
	const qrCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

	const [deletePassword, setDeletePassword] = React.useState('');
	const [deleteTotp, setDeleteTotp] = React.useState('');

	const [currentPassword, setCurrentPassword] = React.useState('');
	const [newPassword, setNewPassword] = React.useState('');
	const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
	const [changePwdTotp, setChangePwdTotp] = React.useState('');
	const [changePwdLoading, setChangePwdLoading] = React.useState(false);
	const [changePwdError, setChangePwdError] = React.useState('');
	const [changePwdSuccess, setChangePwdSuccess] = React.useState('');

	React.useEffect(() => {
		if (!user) {
			window.location.href = '/login';
		}
	}, [user]);

	React.useEffect(() => {
		if (!totpUri || !qrCanvasRef.current) return;
		QRCode.toCanvas(qrCanvasRef.current, totpUri).catch(() => {});
	}, [totpUri]);

	async function saveProfile() {
		if (!user) return;
		setError('');
		if (avatarUrl && avatarUrl.length > 500) return setError(t.avatarUrlTooLong);

		setLoading(true);
		try {
			const data = await apiFetch<{ user: User }>('/user/profile', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({
					avatar_url: avatarUrl,
					email_notifications: emailNotifications
				})
			});
			setUser(data.user);
			setUserState(data.user);
			alert(t.profileSaved);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	async function uploadAvatar(file: File) {
		if (!user) return;
		setError('');
		// allow larger avatar images (2MB)
		if (file.size > 2 * 1024 * 1024) return setError(t.fileTooLarge);

		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', 'avatar');

		setLoading(true);
		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				headers: getSecurityHeaders('POST', null),
				body: formData
			});
		const data = (await res.json()) as any;
				if (!res.ok) throw new Error(data?.error || t.uploadFailed);
			setAvatarUrl(data.url);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	async function requestEmailChange() {
		if (!user) return;
		setError('');
		if (!emailNew) return setError(t.enterNewEmail);
		setLoading(true);
		try {
			await apiFetch('/user/change-email', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({ new_email: emailNew, totp_code: emailTotp })
			});
			alert(t.verifyEmailSent);
			setEmailNew('');
			setEmailTotp('');
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	async function startTotpSetup() {
		setError('');
		setLoading(true);
		try {
			const data = await apiFetch<{ secret: string; uri: string }>('/user/totp/setup', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({})
			});
			setTotpSecret(data.secret);
			setTotpUri(data.uri);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	async function verifyTotp() {
		setError('');
		setLoading(true);
		try {
			await apiFetch('/user/totp/verify', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({ token: totpCode })
			});
			if (user) {
				const updated = { ...user, totp_enabled: true };
				setUser(updated);
				setUserState(updated);
			}
			setTotpSecret('');
			setTotpUri('');
			setTotpCode('');
			alert(t.twoFAActivated);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	async function changePassword() {
		if (!user) return;
		setChangePwdError('');
		setChangePwdSuccess('');
		if (!currentPassword || !newPassword || !confirmNewPassword) return setChangePwdError('请填写所有密码字段');
		if (newPassword !== confirmNewPassword) return setChangePwdError(t.passwordMismatch);
		if (newPassword.length < 8 || newPassword.length > 16) return setChangePwdError('新密码长度须为 8-16 位');
		setChangePwdLoading(true);
		try {
			await apiFetch('/user/change-password', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({
					old_password: currentPassword,
					new_password: newPassword,
					totp_code: changePwdTotp
				})
			});
			setChangePwdSuccess(t.changePasswordSuccess);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmNewPassword('');
			setChangePwdTotp('');
		} catch (e: any) {
			setChangePwdError(String(e?.message || e));
		} finally {
			setChangePwdLoading(false);
		}
	}

	async function deleteAccount() {
		if (!user) return;
		setError('');
		if (!confirm(t.confirmDeleteAccount)) return;
		setLoading(true);
		try {
			await apiFetch('/user/delete', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify({ password: deletePassword, totp_code: deleteTotp })
			});
			logout();
			window.location.href = '/';
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	return (
		<PageShell>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
				<h1 className="text-2xl font-semibold tracking-tight">{t.settingsTitle}</h1>
					<p className="text-sm text-muted-foreground">{t.settingsSubtitle}</p>
					</div>
				<Button
					variant="outline"
					onClick={() => {
						logout();
						window.location.href = '/';
					}}
				>
					{t.logoutBtn}
				</Button>
				</div>

				{error ? <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null}

				<Card>
				<CardHeader>
					<CardTitle>{t.profileCard}</CardTitle>
				</CardHeader>
					<CardContent className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>{t.usernameLabel}</Label>
					<div className="h-10 flex items-center px-3 rounded-xl border-2 border-border bg-muted/50 text-sm text-muted-foreground select-none">
						{user?.username}
					</div>
					<p className="text-xs text-muted-foreground">用户名注册后不可修改</p>
				</div>
				<div className="space-y-2">
					<Label htmlFor="profile-avatar">{t.avatarUrl}</Label>
						<Input id="profile-avatar" value={avatarUrl || ''} onChange={(e) => setAvatarUrl(e.target.value)} />
					</div>
				</div>

					<div className="space-y-2">
						<Label htmlFor="avatar-file">{t.uploadAvatar}</Label>
							<Input
								id="avatar-file"
								type="file"
								accept="image/*"
								onChange={(e) => {
									const f = e.target.files?.[0];
									if (f) uploadAvatar(f);
									e.target.value = '';
								}}
							/>
						</div>

					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							className="h-4 w-4"
							checked={emailNotifications}
							onChange={(e) => setEmailNotifications(e.target.checked)}
						/>
						{t.emailNotifications}
					</label>

					<Button onClick={saveProfile} disabled={loading}>
						{loading ? t.saving : t.saveProfile}
					</Button>
					</CardContent>
				</Card>

				<Card>
				<CardHeader>
					<CardTitle>{t.changeEmail}</CardTitle>
				</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="email-new">{t.newEmail}</Label>
								<Input id="email-new" type="email" value={emailNew} onChange={(e) => setEmailNew(e.target.value)} />
							</div>
						<div className="space-y-2">
							<Label htmlFor="email-totp">{t.twoFACode} {t.twoFAOptional}</Label>
								<Input
									id="email-totp"
									type="text"
									inputMode="numeric"
									maxLength={6}
									autoComplete="one-time-code"
									value={emailTotp}
									onChange={(e) => setEmailTotp(e.target.value)}
								/>
							</div>
						</div>
					<Button onClick={requestEmailChange} disabled={loading}>
						{loading ? t.processing : t.sendConfirmEmail}
					</Button>
					<div className="text-sm text-muted-foreground">{t.confirmEmailHint}</div>
					</CardContent>
				</Card>

				<Card>
				<CardHeader>
					<CardTitle>{t.twoFA}</CardTitle>
				</CardHeader>
					<CardContent className="space-y-4">
					{user?.totp_enabled ? (
						<div className="rounded-md border bg-muted/30 p-3 text-sm">{t.twoFAEnabled}</div>
					) : (
						<>
							<div className="text-sm text-muted-foreground">{t.twoFAHint}</div>
							<Button onClick={startTotpSetup} disabled={loading || !!totpSecret}>
								{loading ? t.processing : t.startSetup}
							</Button>
							{totpSecret ? (
								<div className="space-y-3 rounded-md border p-4">
									<div className="text-sm font-medium">{t.scanQR}</div>
									<canvas ref={qrCanvasRef} />
									<div className="text-sm text-muted-foreground">{t.manualKey}{totpSecret}</div>
									<Separator />
									<div className="text-sm font-medium">{t.enterCode}</div>
									<div className="flex flex-wrap items-center gap-2">
										<Input
											value={totpCode}
											onChange={(e) => setTotpCode(e.target.value)}
											placeholder="000000"
											maxLength={6}
											autoComplete="one-time-code"
											className="w-32"
										/>
										<Button onClick={verifyTotp} disabled={loading}>
											{loading ? t.verifying : t.verifyEnable}
										</Button>
									</div>
								</div>
							) : null}
							</>
						)}
					</CardContent>
			</Card>

			<Card>
			<CardHeader>
				<CardTitle>{t.changePassword}</CardTitle>
			</CardHeader>
				<CardContent className="space-y-4">
					{changePwdError ? <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">{changePwdError}</div> : null}
					{changePwdSuccess ? <div className="rounded-md border border-mint/50 bg-mint/10 p-3 text-sm text-green-700 dark:text-green-300">🎉 {changePwdSuccess}</div> : null}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="current-password">{t.currentPassword}</Label>
							<Input
								id="current-password"
								type="password"
								autoComplete="current-password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="new-password">{t.newPassword} <span className="text-muted-foreground text-xs">(8-16 位)</span></Label>
							<Input
								id="new-password"
								type="password"
								autoComplete="new-password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-new-password">{t.confirmNewPassword}</Label>
							<Input
								id="confirm-new-password"
								type="password"
								autoComplete="new-password"
								value={confirmNewPassword}
								onChange={(e) => setConfirmNewPassword(e.target.value)}
								placeholder="••••••••"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="changepwd-totp">{t.twoFACode} {t.twoFAOptional}</Label>
							<Input
								id="changepwd-totp"
								type="text"
								inputMode="numeric"
								maxLength={6}
								autoComplete="one-time-code"
								value={changePwdTotp}
								onChange={(e) => setChangePwdTotp(e.target.value)}
								placeholder="选填"
							/>
						</div>
					</div>
					<Button onClick={changePassword} disabled={changePwdLoading}>
						{changePwdLoading ? t.processing : t.changePassword}
					</Button>
				</CardContent>
			</Card>

			<Card className="border-destructive/40">
				<CardHeader>
					<CardTitle className="text-destructive">{t.dangerZone}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-sm text-muted-foreground">{t.deleteAccountHint}</div>
						<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="delete-password">{t.password}</Label>
								<Input
									id="delete-password"
									type="password"
									autoComplete="current-password"
									value={deletePassword}
									onChange={(e) => setDeletePassword(e.target.value)}
								/>
							</div>
						<div className="space-y-2">
							<Label htmlFor="delete-totp">{t.twoFACode} {t.twoFAOptional}</Label>
								<Input
									id="delete-totp"
									type="text"
									inputMode="numeric"
									maxLength={6}
									autoComplete="one-time-code"
									value={deleteTotp}
									onChange={(e) => setDeleteTotp(e.target.value)}
								/>
							</div>
						</div>
					<Button variant="destructive" onClick={deleteAccount} disabled={loading}>
						{loading ? t.processing : t.deleteAccount}
					</Button>
					</CardContent>
				</Card>
			</div>
		</PageShell>
	);
}
