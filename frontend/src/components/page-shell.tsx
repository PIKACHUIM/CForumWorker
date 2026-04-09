import * as React from 'react';
import createDOMPurify from 'dompurify';

import { SiteHeader } from '@/components/site-header';
import { getUser, type User } from '@/lib/auth';
import { useConfig } from '@/hooks/use-config';
import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';

// 安全净化 HTML，防止 XSS
function sanitizeHtml(html: string): string {
	const DOMPurify = createDOMPurify(window as unknown as Window);
	return DOMPurify.sanitize(html, { FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'] });
}

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

// 公告横幅组件
function AnnouncementBanner({ html }: { html: string }) {
	const [visible, setVisible] = React.useState(true);
	const { t } = useI18n();
	if (!html || !visible) return null;
	return (
		<div className="mx-auto max-w-5xl px-4 mt-3">
			<div className="glass rounded-2xl border border-sakura/25 shadow-anime px-4 py-2.5 flex items-center justify-between gap-3 text-sm bg-gradient-to-r from-sakura/10 via-lavender/10 to-sky/10 backdrop-blur-md">
				<div className="flex items-center gap-2 flex-1 min-w-0">
					<span className="text-base shrink-0 animate-bounce-gentle">📢</span>
				<span
					className="text-foreground/80 truncate"
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
				/>
				</div>
				<button
					type="button"
					onClick={() => setVisible(false)}
					className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sakura/20 transition-all text-xs"
					aria-label={t.closeAnnouncement}
				>
					✕
				</button>
			</div>
		</div>
	);
}

export function PageShell({
	children,
	toolbar
}: {
	children: React.ReactNode;
	toolbar?: React.ReactNode;
}) {
	const [user, setUser] = React.useState<User | null>(() => getUser());
	const { config } = useConfig();
	const { t } = useI18n();
	const [generatedSecret, setGeneratedSecret] = React.useState<string>('');
	const [showTerms, setShowTerms] = React.useState(false);
	const [showPrivacy, setShowPrivacy] = React.useState(false);

	// if jwt not configured, generate a base64-secret for display
	React.useEffect(() => {
		if (config && config.jwt_secret_configured === false && !generatedSecret) {
			const arr = new Uint8Array(32);
			crypto.getRandomValues(arr);
			const secret = btoa(String.fromCharCode(...arr));
			setGeneratedSecret(secret);
		}
	}, [config, generatedSecret]);

	// 动态注入站点设置
	React.useEffect(() => {
		if (!config) return;

		// 网站标题
		if (config.site_title) {
			document.title = config.site_title;
		}

		// 网站图标
		if (config.site_favicon_url) {
			let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
			if (!link) {
				link = document.createElement('link');
				link.rel = 'icon';
				document.head.appendChild(link);
			}
			link.href = config.site_favicon_url;
		}

		// 主色调
		if (config.site_primary_color) {
			document.documentElement.style.setProperty('--site-primary', config.site_primary_color);
		}

		// 背景图片
		if (config.site_bg_image) {
			document.body.style.backgroundImage = `url(${config.site_bg_image})`;
			document.body.style.backgroundSize = 'cover';
			document.body.style.backgroundAttachment = 'fixed';
			document.body.style.backgroundPosition = 'center';
		}

		// 透明度
		const opacity = parseFloat(config.site_bg_opacity || '1');
		if (!isNaN(opacity) && opacity < 1) {
			document.documentElement.style.setProperty('--content-opacity', String(opacity));
		}

		// 自定义 CSS
		let styleEl = document.getElementById('custom-css') as HTMLStyleElement | null;
		if (config.site_custom_css) {
			if (!styleEl) {
				styleEl = document.createElement('style');
				styleEl.id = 'custom-css';
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = config.site_custom_css;
		} else if (styleEl) {
			styleEl.textContent = '';
		}

		// 自定义 JS（只注入一次）
		if (config.site_custom_js && !document.getElementById('custom-js')) {
			const scriptEl = document.createElement('script');
			scriptEl.id = 'custom-js';
			scriptEl.textContent = config.site_custom_js;
			document.body.appendChild(scriptEl);
		}
	}, [config]);

	const bgStyle: React.CSSProperties = {};
	const opacity = parseFloat(config?.site_bg_opacity || '1');
	if (config?.site_bg_image && !isNaN(opacity) && opacity < 1) {
		bgStyle.opacity = opacity;
	}

	return (
		<div className="min-h-dvh">
			{showTerms && (
				<PolicyModal
					title={t.termsTitle}
					content={config?.site_terms || ''}
					onClose={() => setShowTerms(false)}
				/>
			)}
			{showPrivacy && (
				<PolicyModal
					title={t.privacyTitle}
					content={config?.site_privacy || ''}
					onClose={() => setShowPrivacy(false)}
				/>
			)}
			<SiteHeader currentUser={user} onLogout={() => setUser(null)} config={config} toolbar={toolbar} />

			{/* 站点公告横幅 - 顶栏下方 */}
			{config?.site_announcement ? (
				<AnnouncementBanner html={config.site_announcement} />
			) : null}

			{/* JWT 未配置警告 */}
			{config && config.jwt_secret_configured === false && (
				<div className="mx-auto max-w-5xl px-4 mt-3">
					<div className="glass rounded-2xl border border-yellow-400/40 bg-yellow-50/70 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200 backdrop-blur-md shadow-anime">
						⚠️ {t.jwtWarning} <strong>JWT_SECRET</strong>。
						{t.jwtSuggested}<code className="ml-2 break-all text-xs bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">{generatedSecret}</code>
					</div>
				</div>
			)}
			<main className="mx-auto w-full max-w-5xl px-4 py-6" style={bgStyle}>{children}</main>

		{/* 页脚 */}
			<footer className="mt-8 border-t border-sakura/20 py-6 text-center text-xs text-muted-foreground">
				{config?.site_footer_html ? (
					<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.site_footer_html) }} />
				) : (
					<span>Powered by <span className="text-primary font-medium">CForum</span> ✨</span>
				)}
				{config?.site_icp ? (
					<div className="mt-1">
						<a
							href="https://beian.miit.gov.cn/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary transition-colors"
						>
							{config.site_icp}
						</a>
					</div>
				) : null}
				{(config?.site_terms || config?.site_privacy) ? (
					<div className="mt-2 flex items-center justify-center gap-3">
						{config?.site_terms ? (
							<button
								type="button"
								onClick={() => setShowTerms(true)}
								className="hover:text-primary transition-colors hover:underline"
							>
								{t.termsTitle}
							</button>
						) : null}
						{config?.site_terms && config?.site_privacy ? (
							<span className="text-muted-foreground/40">·</span>
						) : null}
						{config?.site_privacy ? (
							<button
								type="button"
								onClick={() => setShowPrivacy(true)}
								className="hover:text-primary transition-colors hover:underline"
							>
								{t.privacyTitle}
							</button>
						) : null}
					</div>
				) : null}
			</footer>
		</div>
	);
}

