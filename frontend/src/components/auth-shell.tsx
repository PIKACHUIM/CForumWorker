import * as React from 'react';
import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/use-config';

/**
 * 二次元风格认证页面背景容器
 * 包含渐变背景、浮动装饰元素和毛玻璃卡片效果
 */
export function AuthPageShell({
	children,
	className
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const { config } = useConfig();

	// 动态设置站点标题和图标（与 PageShell 保持一致）
	React.useEffect(() => {
		if (!config) return;
		if (config.site_title) {
			// 保留页面原有的子标题前缀（如"登录 - "）
			const current = document.title;
			const sep = current.indexOf(' - ');
			const prefix = sep !== -1 ? current.slice(0, sep + 3) : '';
			document.title = prefix + config.site_title;
		}
		if (config.site_favicon_url) {
			let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
			if (!link) {
				link = document.createElement('link');
				link.rel = 'icon';
				document.head.appendChild(link);
			}
			link.href = config.site_favicon_url;
		}
	}, [config]);

	return (
		<div className={cn(
			'min-h-dvh relative overflow-hidden',
			'bg-gradient-to-br from-[#FFF0F5] via-[#F5F0FF] to-[#F0F8FF]',
			'dark:from-[#1A1B2E] dark:via-[#1E1A2E] dark:to-[#1A2030]',
			className
		)}>
			{/* 浮动装饰元素 */}
			<div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
				<span className="deco-float" style={{ top: '8%', left: '5%', animationDelay: '0s', fontSize: '2rem' }}>🌸</span>
				<span className="deco-float" style={{ top: '15%', right: '8%', animationDelay: '0.5s', fontSize: '1.5rem' }}>⭐</span>
				<span className="deco-float" style={{ top: '60%', left: '3%', animationDelay: '1s', fontSize: '1.2rem' }}>✨</span>
				<span className="deco-float" style={{ top: '75%', right: '5%', animationDelay: '1.5s', fontSize: '1.8rem' }}>🌙</span>
				<span className="deco-float" style={{ top: '40%', right: '3%', animationDelay: '2s', fontSize: '1rem' }}>💫</span>
				<span className="deco-float" style={{ top: '85%', left: '10%', animationDelay: '0.8s', fontSize: '1.3rem' }}>🌟</span>
				{/* 大背景圆形装饰 */}
				<div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sakura/10 blur-3xl" />
				<div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-lavender/10 blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-sky/5 blur-2xl" />
			</div>

			{/* 内容区 */}
			<main className="relative z-10 mx-auto flex min-h-dvh max-w-5xl items-center justify-center px-4 py-10">
				{children}
			</main>
		</div>
	);
}

/**
 * 二次元风格认证卡片
 */
export function AuthCard({
	children,
	className
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn(
			'w-full max-w-md animate-slide-up',
			'glass rounded-2xl shadow-anime-lg',
			'border border-sakura/20',
			className
		)}>
			{/* 顶部渐变装饰条 */}
			<div className="h-1 rounded-t-2xl bg-gradient-to-r from-sakura via-lavender to-sky" />
			{children}
		</div>
	);
}
