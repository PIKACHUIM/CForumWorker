import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getUser, logout, type User } from '@/lib/auth';
import { getTheme, toggleTheme, type Theme } from '@/lib/theme';
import type { ForumConfig } from '@/lib/api';
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

	React.useEffect(() => {
		function onThemeChange(e: Event) {
			const next = (e as CustomEvent).detail;
			if (next === 'light' || next === 'dark') setTheme(next);
		}
		window.addEventListener('theme-change', onThemeChange as any);
		setTheme(getTheme());
		return () => window.removeEventListener('theme-change', onThemeChange as any);
	}, []);

	function handleToggleTheme() {
		setSpinning(true);
		toggleTheme();
		setTimeout(() => setSpinning(false), 600);
	}

	const siteTitle = config?.site_title || 'CForum';
	const siteDesc = config?.site_description || '';

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
								<span className="font-display text-lg font-bold bg-gradient-to-r from-[#e879a0] to-[#a855f7] bg-clip-text text-transparent group-hover:opacity-80 transition-opacity leading-tight">
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
								title="切换主题"
							>
								<span className={spinning ? 'animate-spin-slow' : 'transition-transform duration-300'}>
									{theme === 'dark'
										? <Sun className="h-4 w-4 text-stargold" />
										: <Moon className="h-4 w-4 text-lavender" />
									}
								</span>
								<span className="sr-only">切换主题</span>
							</button>

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
												<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sakura to-lavender text-white text-[10px]">
													<UserIcon className="h-4 w-4" />
												</span>
											)}
										</span>
										<span className="hidden sm:inline">
											欢迎，<span className="font-medium text-foreground">{user.username}</span>
										</span>
										{user.role === 'admin' ? (
											<span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
												<Shield className="h-3 w-3" />
												管理员
											</span>
										) : null}
									</span>

									{/* 管理后台按钮 */}
									{user.role === 'admin' ? (
										<Button asChild variant="ghost" size="icon" title="管理后台">
											<a href="/admin">
												<Shield className="h-4 w-4" />
												<span className="sr-only">管理后台</span>
											</a>
										</Button>
									) : null}

									{/* 设置按钮 */}
									<Button asChild variant="ghost" size="icon" title="设置">
										<a href="/settings">
											<Settings className="h-4 w-4" />
											<span className="sr-only">设置</span>
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
										<span className="hidden sm:inline">退出</span>
									</Button>
								</>
							) : (
								<>
									<Button asChild variant="ghost" size="sm">
										<a href="/login" className="flex items-center gap-1.5">
											<LogIn className="h-4 w-4" />
											<span>登录</span>
										</a>
									</Button>
									<Button asChild size="sm">
										<a href="/register" className="flex items-center gap-1.5">
											<UserPlus className="h-4 w-4" />
											<span>注册</span>
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
