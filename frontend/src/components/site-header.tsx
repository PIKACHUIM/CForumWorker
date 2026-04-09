import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getUser, logout, type User } from '@/lib/auth';
import { getTheme, toggleTheme, type Theme } from '@/lib/theme';
import type { ForumConfig } from '@/lib/api';
import { LOCALES, type Locale } from '@/lib/i18n';
import { useI18n } from '@/hooks/use-i18n';
import { LogIn, LogOut, Moon, Settings, Shield, Sun, User as UserIcon, UserPlus } from 'lucide-react';

export function SiteHeader({
	currentUser,
	onLogout,
	config,
	toolbar
}: {
	currentUser: User | null;
	onLogout?: () => void;
	config?: ForumConfig | null;
	toolbar?: React.ReactNode;
}) {
	const user = currentUser ?? getUser();
	const [theme, setTheme] = React.useState<Theme>(() => getTheme());
	const [spinning, setSpinning] = React.useState(false);
	const { locale, t, setLocale } = useI18n();
	const [langOpen, setLangOpen] = React.useState(false);
	const langMenuRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		function onThemeChange(e: Event) {
			const next = (e as CustomEvent).detail;
			if (next === 'light' || next === 'dark') setTheme(next);
		}
		window.addEventListener('theme-change', onThemeChange as any);
		setTheme(getTheme());
		return () => window.removeEventListener('theme-change', onThemeChange as any);
	}, []);

	React.useEffect(() => {
		if (!langOpen) return;
		function onPointerDown(e: MouseEvent | TouchEvent) {
			const target = e.target as Node | null;
			if (!target) return;
			if (langMenuRef.current && !langMenuRef.current.contains(target)) setLangOpen(false);
		}
		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('touchstart', onPointerDown);
		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('touchstart', onPointerDown);
		};
	}, [langOpen]);

	function handleToggleTheme() {
		setSpinning(true);
		toggleTheme();
		setTimeout(() => setSpinning(false), 600);
	}

	const siteTitle = config?.site_title || 'CForum';
	const siteDesc = config?.site_description || '';
	const currentLang = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

	return (
		<header className="w-full sticky top-3 z-40">
			<div className="mx-auto max-w-5xl px-4">
				<div className="glass rounded-2xl border border-sakura/20 shadow-anime px-5 py-3 flex flex-col gap-0">
					{/* 主行：Logo + 右侧操作区 */}
					<div className="flex items-center justify-between gap-4">
						{/* Logo 区域 */}
						<a
							href="/"
							className="inline-flex items-center gap-2 group"
						>
							<span className="text-xl animate-bounce-gentle">🌸</span>
							<div className="flex flex-col">
			<span className="font-display text-lg font-bold bg-gradient-to-r from-[#f43f8e] to-[#a855f7] bg-clip-text text-transparent group-hover:opacity-80 transition-opacity leading-tight whitespace-nowrap min-w-[4em]">
									{siteTitle}
								</span>
								{siteDesc ? (
									<span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{siteDesc}</span>
								) : null}
							</div>
						</a>

						{/* 右侧操作区 */}
						<div className="flex items-center gap-2">
							{/* 主题切换按钮 */}
							<button
								type="button"
								onClick={handleToggleTheme}
								className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-sakura/10 transition-all duration-200 hover:scale-110"
								title={t.toggleTheme}
							>
								<span className={spinning ? 'animate-spin-slow' : 'transition-transform duration-300'}>
									{theme === 'dark'
										? <Sun className="h-4 w-4 text-stargold" />
										: <Moon className="h-4 w-4 text-lavender" />
									}
								</span>
								<span className="sr-only">{t.toggleTheme}</span>
							</button>

							{/* 语言切换按钮 */}
							<div className="relative" ref={langMenuRef}>
								<button
									type="button"
									onClick={() => setLangOpen((v) => !v)}
									className="h-9 px-2 rounded-full flex items-center gap-1 hover:bg-sakura/10 transition-all duration-200 text-sm"
									title={t.switchLanguage}
									aria-haspopup="listbox"
									aria-expanded={langOpen}
								>
									<span>{currentLang.flag}</span>
									<span className="hidden sm:inline text-xs text-muted-foreground">{currentLang.label}</span>
								</button>
								{langOpen ? (
									<div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-xl border-2 border-sakura/20 bg-background/95 p-1 shadow-anime backdrop-blur-sm">
										{LOCALES.map((l) => (
											<button
												key={l.value}
												type="button"
												role="option"
												aria-selected={l.value === locale}
												className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors hover:bg-sakura/10 ${l.value === locale ? 'font-semibold text-primary' : ''}`}
												onClick={() => {
													setLocale(l.value as Locale);
													setLangOpen(false);
												}}
											>
												<span>{l.flag}</span>
												<span>{l.label}</span>
											</button>
										))}
									</div>
								) : null}
							</div>

							{user ? (
								<>
									{/* 用户信息 */}
									<span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
										{/* 头像 */}
										<span className="avatar-anime transition-transform duration-300 hover:rotate-12">
											{user.avatar_url ? (
												<img
													src={user.avatar_url}
													alt=""
													className="h-7 w-7 rounded-full object-cover"
													loading="lazy"
													referrerPolicy="no-referrer"
												/>
											) : (
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f43f8e] to-[#a855f7] text-white">
							<UserIcon className="h-5 w-5" />
												</span>
											)}
										</span>
										<span className="hidden sm:inline">
											{t.welcome}<span className="font-medium text-foreground">{user.username}</span>
										</span>
										{user.role === 'admin' ? (
											<span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
												<Shield className="h-3 w-3" />
												{t.admin}
											</span>
										) : null}
									</span>

									{/* 管理后台按钮 */}
									{user.role === 'admin' ? (
										<Button asChild variant="ghost" size="icon" title={t.adminPanel}>
											<a href="/admin">
												<Shield className="h-4 w-4" />
												<span className="sr-only">{t.adminPanel}</span>
											</a>
										</Button>
									) : null}

									{/* 设置按钮 */}
									<Button asChild variant="ghost" size="icon" title={t.settings}>
										<a href="/settings">
											<Settings className="h-4 w-4" />
											<span className="sr-only">{t.settings}</span>
										</a>
									</Button>

									<Separator orientation="vertical" className="h-6 bg-sakura/30" />

									{/* 退出按钮 */}
									<Button
										variant="outline"
										size="sm"
										className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
										onClick={() => {
											logout();
											onLogout?.();
											window.location.href = '/';
										}}
									>
										<LogOut className="h-4 w-4" />
										<span className="hidden sm:inline">{t.logout}</span>
									</Button>
								</>
							) : (
								<>
									<Button asChild variant="ghost" size="sm">
										<a href="/login" className="flex items-center gap-1.5">
											<LogIn className="h-4 w-4" />
											<span>{t.login}</span>
										</a>
									</Button>
									<Button asChild size="sm">
										<a href="/register" className="flex items-center gap-1.5">
											<UserPlus className="h-4 w-4" />
											<span>{t.register}</span>
										</a>
									</Button>
								</>
							)}
						</div>
					</div>

					{/* 工具栏行（可选，由页面传入） */}
					{toolbar ? (
						<>
							<div className="mt-2.5 border-t border-sakura/15" />
							<div className="pt-2.5 pb-0.5">
								{toolbar}
							</div>
						</>
					) : null}
				</div>
			</div>
		</header>
	);
}
