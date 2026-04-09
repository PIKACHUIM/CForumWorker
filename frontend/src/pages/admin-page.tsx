import * as React from 'react';
import imageCompression from 'browser-image-compression';
import {
	BarChart2, FileText, MessageSquare, RefreshCw,
	Settings, Shield, Users, User as UserIcon, Search, X,
	EyeOff, Lock, Trash2, CheckCircle, Ban, ChevronLeft, ChevronRight, Tag,
	AlertTriangle, Info, CheckCircle2, XCircle, HardDrive
} from 'lucide-react';

import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, formatDate, getSecurityHeaders, type Category } from '@/lib/api';
import { getToken, getUser } from '@/lib/auth';

// ─── Toast 通知系统 ───────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: number; type: ToastType; message: string };

const ToastContext = React.createContext<(type: ToastType, message: string) => void>(() => {});

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
	if (toasts.length === 0) return null;
	const icons: Record<ToastType, React.ReactNode> = {
		success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
		error:   <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
		warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
		info:    <Info className="h-4 w-4 text-sky-500 shrink-0" />,
	};
	const colors: Record<ToastType, string> = {
		success: 'border-emerald-200 bg-emerald-50/95 dark:bg-emerald-900/30 dark:border-emerald-700/50',
		error:   'border-red-200 bg-red-50/95 dark:bg-red-900/30 dark:border-red-700/50',
		warning: 'border-amber-200 bg-amber-50/95 dark:bg-amber-900/30 dark:border-amber-700/50',
		info:    'border-sky-200 bg-sky-50/95 dark:bg-sky-900/30 dark:border-sky-700/50',
	};
	return (
		<div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
			{toasts.map(t => (
				<div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-300 ${colors[t.type]}`}>
					{icons[t.type]}
					<span className="text-sm flex-1 leading-snug">{t.message}</span>
					<button onClick={() => onRemove(t.id)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			))}
		</div>
	);
}

function useToast() {
	return React.useContext(ToastContext);
}

// ─── 确认对话框 ───────────────────────────────────────────────
function ConfirmDialog({
	open, title, description, confirmLabel = '确认', confirmVariant = 'destructive', onConfirm, onCancel
}: {
	open: boolean;
	title: string;
	description?: string;
	confirmLabel?: string;
	confirmVariant?: 'destructive' | 'default';
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={v => !v && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-500" />
						{title}
					</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>取消</Button>
					<Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── 默认协议模板 ─────────────────────────────────────────────
const DEFAULT_TERMS = `用户协议

欢迎使用本论坛（以下简称"本站"）。在注册和使用本站服务之前，请仔细阅读以下条款。

一、账号注册
1. 您需要提供真实有效的邮箱地址完成注册。
2. 您有责任保管好自己的账号和密码，因账号泄露造成的损失由您自行承担。
3. 每人只能注册一个账号，禁止注册多个账号进行恶意行为。

二、用户行为规范
1. 禁止发布违反法律法规的内容，包括但不限于：违法信息、色情内容、赌博信息等。
2. 禁止发布侵犯他人知识产权、隐私权的内容。
3. 禁止对其他用户进行骚扰、辱骂、人身攻击。
4. 禁止发布广告、垃圾信息或进行恶意刷屏。
5. 禁止利用本站进行任何形式的欺诈行为。

三、内容版权
1. 您在本站发布的内容，版权归您所有，但您授予本站免费使用、展示的权利。
2. 本站有权对违规内容进行删除、隐藏或锁定处理。

四、免责声明
1. 本站对用户发布的内容不承担法律责任，但会积极配合相关部门处理违规内容。
2. 本站保留随时修改、中断或终止服务的权利。

五、协议修改
本站有权随时修改本协议，修改后的协议将在本站公布，继续使用本站即视为同意修改后的协议。`;

const DEFAULT_PRIVACY = `隐私政策

本站非常重视您的隐私保护，请仔细阅读以下隐私政策。

一、信息收集
我们收集以下信息：
1. 注册信息：邮箱地址、用户名（密码经加密存储，不会明文保存）。
2. 使用信息：您发布的帖子、评论内容。
3. 技术信息：IP 地址、浏览器类型（用于安全防护）。

二、信息使用
收集的信息用于：
1. 提供、维护和改善本站服务。
2. 发送账号相关通知（如邮箱验证、密码重置）。
3. 防止欺诈和滥用行为。

三、信息保护
1. 我们采用行业标准的安全措施保护您的信息。
2. 我们不会将您的个人信息出售给第三方。
3. 除法律要求外，我们不会向第三方披露您的个人信息。

四、Cookie
本站使用 Cookie 和本地存储保存您的登录状态，您可以通过浏览器设置禁用 Cookie，但这可能影响部分功能的使用。

五、您的权利
您有权：
1. 访问、更正您的个人信息（通过账号设置页面）。
2. 删除您的账号及相关数据（联系管理员）。

六、联系我们
如对本隐私政策有任何疑问，请通过站内联系管理员。`;

type AdminTab = 'overview' | 'posts' | 'users' | 'comments' | 'categories' | 'settings' | 'storage';

// ─── 状态徽章 ────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
	const map: Record<string, { label: string; cls: string }> = {
		normal:  { label: '正常',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
		hidden:  { label: '已隐藏', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
		locked:  { label: '已锁定', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
		deleted: { label: '已删除', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
		banned:  { label: '已封禁', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
	};
	const s = map[status || 'normal'] || map.normal;
	return <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
}

// ─── 帖子管理 Tab ─────────────────────────────────────────────
function PostsTab() {
	const toast = useToast();
	const [posts, setPosts] = React.useState<any[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [q, setQ] = React.useState('');
	const [status, setStatus] = React.useState('');
	const [offset, setOffset] = React.useState(0);
	const limit = 15;
	// 确认弹窗
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [pendingAction, setPendingAction] = React.useState<{ id: number; action: string } | null>(null);

	const load = React.useCallback(async (off = 0) => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: String(limit), offset: String(off) });
			if (q) params.set('q', q);
			if (status) params.set('status', status);
			const data = await apiFetch<any>(`/admin/posts?${params}`, { headers: getSecurityHeaders('GET') });
			setPosts(data.posts || []);
			setTotal(data.total || 0);
			setOffset(off);
		} catch {}
		setLoading(false);
	}, [q, status]);

	React.useEffect(() => { load(0); }, [load]);

	function doAction(id: number, action: string) {
		if (action === 'delete') {
			setPendingAction({ id, action });
			setConfirmOpen(true);
		} else {
			execAction(id, action);
		}
	}

	async function execAction(id: number, action: string) {
		try {
			await apiFetch(`/admin/posts/${id}/action`, {
				method: 'POST', headers: getSecurityHeaders('POST'),
				body: JSON.stringify({ action })
			});
			toast('success', '操作成功');
			load(offset);
		} catch (e: any) { toast('error', e?.message || '操作失败'); }
	}

	const totalPages = Math.max(1, Math.ceil(total / limit));
	const currentPage = Math.floor(offset / limit) + 1;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2 items-center">
				<div className="relative flex-1 min-w-[180px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索标题/内容…" className="pl-9 h-9" onKeyDown={e => e.key === 'Enter' && load(0)} />
				</div>
				<select value={status} onChange={e => { setStatus(e.target.value); }} className="h-9 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-sakura">
					<option value="">全部状态</option>
					<option value="normal">正常</option>
					<option value="hidden">已隐藏</option>
					<option value="locked">已锁定</option>
				</select>
				<Button size="sm" variant="outline" onClick={() => load(0)} disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
			</div>

			<div className="overflow-x-auto rounded-xl border border-sakura/20">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-sakura/10 to-lavender/10 text-left">
						<tr>
							<th className="px-3 py-2.5 font-medium">标题</th>
							<th className="px-3 py-2.5 font-medium hidden md:table-cell">作者</th>
							<th className="px-3 py-2.5 font-medium hidden lg:table-cell">分类</th>
							<th className="px-3 py-2.5 font-medium">状态</th>
							<th className="px-3 py-2.5 font-medium hidden md:table-cell">时间</th>
							<th className="px-3 py-2.5 font-medium">操作</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan={6} className="py-8 text-center text-muted-foreground">加载中…</td></tr>
						) : posts.length === 0 ? (
							<tr><td colSpan={6} className="py-8 text-center text-muted-foreground">暂无数据</td></tr>
						) : posts.map(p => (
							<tr key={p.id} className="border-t border-sakura/10 hover:bg-sakura/5 transition-colors">
								<td className="px-3 py-2 max-w-[200px]">
<a href={`/post?id=${p.id}`} target="_blank" rel="noopener noreferrer" className="truncate block hover:text-primary transition-colors">{p.title}</a>
								</td>
								<td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{p.author_name}</td>
								<td className="px-3 py-2 hidden lg:table-cell text-muted-foreground">{p.category_name || '未分类'}</td>
								<td className="px-3 py-2"><StatusBadge status={p.status} /></td>
								<td className="px-3 py-2 hidden md:table-cell text-muted-foreground whitespace-nowrap">{formatDate(p.created_at)}</td>
								<td className="px-3 py-2">
									<div className="flex items-center gap-1">
										{p.status !== 'hidden' && <button title="隐藏" onClick={() => doAction(p.id, 'hide')} className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"><EyeOff className="h-3.5 w-3.5" /></button>}
										{p.status === 'hidden' && <button title="恢复" onClick={() => doAction(p.id, 'restore')} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"><CheckCircle className="h-3.5 w-3.5" /></button>}
										{p.status !== 'locked' && <button title="锁定" onClick={() => doAction(p.id, 'lock')} className="p-1 rounded hover:bg-orange-100 text-orange-600 transition-colors"><Lock className="h-3.5 w-3.5" /></button>}
										{p.status === 'locked' && <button title="解锁" onClick={() => doAction(p.id, 'restore')} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"><CheckCircle className="h-3.5 w-3.5" /></button>}
										<button title="删除" onClick={() => doAction(p.id, 'delete')} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>共 {total} 条</span>
				<div className="flex items-center gap-1">
					<Button size="sm" variant="outline" disabled={currentPage <= 1 || loading} onClick={() => load(offset - limit)}><ChevronLeft className="h-4 w-4" /></Button>
					<span className="px-2">{currentPage} / {totalPages}</span>
					<Button size="sm" variant="outline" disabled={currentPage >= totalPages || loading} onClick={() => load(offset + limit)}><ChevronRight className="h-4 w-4" /></Button>
				</div>
			</div>
			<ConfirmDialog
				open={confirmOpen}
				title="删除帖子"
				description="确定删除该帖子？此操作不可撤销。"
				confirmLabel="删除"
				onConfirm={() => { setConfirmOpen(false); if (pendingAction) execAction(pendingAction.id, pendingAction.action); }}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}

// ─── 评论管理 Tab ─────────────────────────────────────────────
function CommentsTab() {
	const toast = useToast();
	const [comments, setComments] = React.useState<any[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [q, setQ] = React.useState('');
	const [status, setStatus] = React.useState('');
	const [offset, setOffset] = React.useState(0);
	const limit = 15;
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [pendingAction, setPendingAction] = React.useState<{ id: number; action: string } | null>(null);

	const load = React.useCallback(async (off = 0) => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: String(limit), offset: String(off) });
			if (q) params.set('q', q);
			if (status) params.set('status', status);
			const data = await apiFetch<any>(`/admin/comments?${params}`, { headers: getSecurityHeaders('GET') });
			setComments(data.comments || []);
			setTotal(data.total || 0);
			setOffset(off);
		} catch {}
		setLoading(false);
	}, [q, status]);

	React.useEffect(() => { load(0); }, [load]);

	function doAction(id: number, action: string) {
		if (action === 'delete') {
			setPendingAction({ id, action });
			setConfirmOpen(true);
		} else {
			execAction(id, action);
		}
	}

	async function execAction(id: number, action: string) {
		try {
			await apiFetch(`/admin/comments/${id}/action`, {
				method: 'POST', headers: getSecurityHeaders('POST'),
				body: JSON.stringify({ action })
			});
			toast('success', '操作成功');
			load(offset);
		} catch (e: any) { toast('error', e?.message || '操作失败'); }
	}

	const totalPages = Math.max(1, Math.ceil(total / limit));
	const currentPage = Math.floor(offset / limit) + 1;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2 items-center">
				<div className="relative flex-1 min-w-[180px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索评论内容…" className="pl-9 h-9" onKeyDown={e => e.key === 'Enter' && load(0)} />
				</div>
				<select value={status} onChange={e => setStatus(e.target.value)} className="h-9 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-sakura">
					<option value="">全部状态</option>
					<option value="normal">正常</option>
					<option value="hidden">已隐藏</option>
					<option value="locked">已锁定</option>
				</select>
				<Button size="sm" variant="outline" onClick={() => load(0)} disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
			</div>

			<div className="overflow-x-auto rounded-xl border border-sakura/20">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-sakura/10 to-lavender/10 text-left">
						<tr>
							<th className="px-3 py-2.5 font-medium">内容</th>
							<th className="px-3 py-2.5 font-medium hidden md:table-cell">作者</th>
							<th className="px-3 py-2.5 font-medium hidden lg:table-cell">所属帖子</th>
							<th className="px-3 py-2.5 font-medium">状态</th>
							<th className="px-3 py-2.5 font-medium hidden md:table-cell">时间</th>
							<th className="px-3 py-2.5 font-medium">操作</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan={6} className="py-8 text-center text-muted-foreground">加载中…</td></tr>
						) : comments.length === 0 ? (
							<tr><td colSpan={6} className="py-8 text-center text-muted-foreground">暂无数据</td></tr>
						) : comments.map(c => (
							<tr key={c.id} className="border-t border-sakura/10 hover:bg-sakura/5 transition-colors">
								<td className="px-3 py-2 max-w-[200px]">
									<span className="truncate block text-muted-foreground">{(c.content || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").slice(0, 60)}{(c.content || '').length > 60 ? '…' : ''}</span>
								</td>
								<td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{c.author_name}</td>
								<td className="px-3 py-2 hidden lg:table-cell">
<a href={`/post?id=${c.post_id}`} target="_blank" rel="noopener noreferrer" className="truncate block hover:text-primary transition-colors max-w-[120px]">{c.post_title}</a>
								</td>
								<td className="px-3 py-2"><StatusBadge status={c.status} /></td>
								<td className="px-3 py-2 hidden md:table-cell text-muted-foreground whitespace-nowrap">{formatDate(c.created_at)}</td>
								<td className="px-3 py-2">
									<div className="flex items-center gap-1">
										{c.status !== 'hidden' && <button title="隐藏" onClick={() => doAction(c.id, 'hide')} className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"><EyeOff className="h-3.5 w-3.5" /></button>}
										{c.status === 'hidden' && <button title="恢复" onClick={() => doAction(c.id, 'restore')} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"><CheckCircle className="h-3.5 w-3.5" /></button>}
										{c.status !== 'locked' && <button title="锁定" onClick={() => doAction(c.id, 'lock')} className="p-1 rounded hover:bg-orange-100 text-orange-600 transition-colors"><Lock className="h-3.5 w-3.5" /></button>}
										{c.status === 'locked' && <button title="解锁" onClick={() => doAction(c.id, 'restore')} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"><CheckCircle className="h-3.5 w-3.5" /></button>}
										<button title="删除" onClick={() => doAction(c.id, 'delete')} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>共 {total} 条</span>
				<div className="flex items-center gap-1">
					<Button size="sm" variant="outline" disabled={currentPage <= 1 || loading} onClick={() => load(offset - limit)}><ChevronLeft className="h-4 w-4" /></Button>
					<span className="px-2">{currentPage} / {totalPages}</span>
					<Button size="sm" variant="outline" disabled={currentPage >= totalPages || loading} onClick={() => load(offset + limit)}><ChevronRight className="h-4 w-4" /></Button>
				</div>
			</div>
			<ConfirmDialog
				open={confirmOpen}
				title="删除评论"
				description="确定删除该评论？此操作不可撤销。"
				confirmLabel="删除"
				onConfirm={() => { setConfirmOpen(false); if (pendingAction) execAction(pendingAction.id, pendingAction.action); }}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}

// ─── 用户管理 Tab ─────────────────────────────────────────────
function UsersTab({ currentUserId }: { currentUserId?: number }) {
	const toast = useToast();
	const [users, setUsers] = React.useState<any[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [q, setQ] = React.useState('');
	const [status, setStatus] = React.useState('');
	const [offset, setOffset] = React.useState(0);
	const limit = 15;

	// 编辑弹窗
	const [editOpen, setEditOpen] = React.useState(false);
	const [editUser, setEditUser] = React.useState<any>(null);
	const [editUsername, setEditUsername] = React.useState('');
	const [editEmail, setEditEmail] = React.useState('');
	const [editAvatarUrl, setEditAvatarUrl] = React.useState('');
	const [editPassword, setEditPassword] = React.useState('');
	const [editLoading, setEditLoading] = React.useState(false);
	// 确认弹窗
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [confirmConfig, setConfirmConfig] = React.useState<{ title: string; desc: string; onOk: () => void } | null>(null);

	const load = React.useCallback(async (off = 0) => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: String(limit), offset: String(off) });
			if (q) params.set('q', q);
			if (status) params.set('status', status);
			const data = await apiFetch<any>(`/admin/users?${params}`, { headers: getSecurityHeaders('GET') });
			setUsers(data.users || []);
			setTotal(data.total || 0);
			setOffset(off);
		} catch {}
		setLoading(false);
	}, [q, status]);

	React.useEffect(() => { load(0); }, [load]);

	function doAction(id: number, action: string) {
		const labels: Record<string, string> = { ban: '封禁', unban: '解封', hide: '隐藏所有内容' };
		setConfirmConfig({
			title: `${labels[action] || action}用户`,
			desc: `确定要${labels[action] || action}该用户？`,
			onOk: async () => {
				try {
					await apiFetch(`/admin/users/${id}/action`, {
						method: 'POST', headers: getSecurityHeaders('POST'),
						body: JSON.stringify({ action })
					});
					toast('success', '操作成功');
					load(offset);
				} catch (e: any) { toast('error', e?.message || '操作失败'); }
			}
		});
		setConfirmOpen(true);
	}

	function deleteUser(id: number) {
		setConfirmConfig({
			title: '删除用户',
			desc: '确定删除该用户？此操作不可撤销。',
			onOk: async () => {
				try {
					await apiFetch(`/admin/users/${id}`, { method: 'DELETE', headers: getSecurityHeaders('DELETE') });
					toast('success', '用户已删除');
					load(offset);
				} catch (e: any) { toast('error', e?.message || '操作失败'); }
			}
		});
		setConfirmOpen(true);
	}

	function manualVerify(id: number) {
		setConfirmConfig({
			title: '手动验证用户',
			desc: '确认手动验证此用户邮箱？',
			onOk: async () => {
				try {
					await apiFetch(`/admin/users/${id}/verify`, { method: 'POST', headers: getSecurityHeaders('POST'), body: JSON.stringify({}) });
					toast('success', '用户已验证');
					load(offset);
				} catch (e: any) { toast('error', e?.message || '操作失败'); }
			}
		});
		setConfirmOpen(true);
	}

	function openEdit(u: any) {
		setEditUser(u);
		setEditUsername(u.username || '');
		setEditEmail(u.email || '');
		setEditAvatarUrl(u.avatar_url || '');
		setEditPassword('');
		setEditOpen(true);
	}

	async function saveEdit() {
		if (!editUser) return;
		setEditLoading(true);
		try {
			await apiFetch(`/admin/users/${editUser.id}/update`, {
				method: 'POST', headers: getSecurityHeaders('POST'),
				body: JSON.stringify({
					email: editEmail || undefined,
					username: editUsername || undefined,
					avatar_url: editAvatarUrl,
					password: editPassword || undefined
				})
			});
			toast('success', '用户信息已保存');
			setEditOpen(false);
			load(offset);
		} catch (e: any) { toast('error', e?.message || '保存失败'); }
		setEditLoading(false);
	}

	const totalPages = Math.max(1, Math.ceil(total / limit));
	const currentPage = Math.floor(offset / limit) + 1;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2 items-center">
				<div className="relative flex-1 min-w-[180px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索用户名/邮箱…" className="pl-9 h-9" onKeyDown={e => e.key === 'Enter' && load(0)} />
				</div>
				<select value={status} onChange={e => setStatus(e.target.value)} className="h-9 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-sakura">
					<option value="">全部状态</option>
					<option value="normal">正常</option>
					<option value="banned">已封禁</option>
				</select>
				<Button size="sm" variant="outline" onClick={() => load(0)} disabled={loading}><RefreshCw className="h-4 w-4" /></Button>
			</div>

			<div className="overflow-x-auto rounded-xl border border-sakura/20">
				<table className="w-full text-sm">
					<thead className="bg-gradient-to-r from-sakura/10 to-lavender/10 text-left">
						<tr>
							<th className="px-3 py-2.5 font-medium">用户</th>
							<th className="px-3 py-2.5 font-medium hidden md:table-cell">邮箱</th>
							<th className="px-3 py-2.5 font-medium">角色/状态</th>
							<th className="px-3 py-2.5 font-medium hidden lg:table-cell">注册时间</th>
							<th className="px-3 py-2.5 font-medium">操作</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan={5} className="py-8 text-center text-muted-foreground">加载中…</td></tr>
						) : users.length === 0 ? (
							<tr><td colSpan={5} className="py-8 text-center text-muted-foreground">暂无数据</td></tr>
						) : users.map(u => (
							<tr key={u.id} className="border-t border-sakura/10 hover:bg-sakura/5 transition-colors">
								<td className="px-3 py-2">
									<span className="inline-flex items-center gap-2">
										{u.avatar_url
											? <img src={u.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
: <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#f43f8e] to-[#a855f7] text-white text-[10px]"><UserIcon className="h-3.5 w-3.5" /></span>
										}
										<span className="font-medium">{u.username}</span>
										{u.role === 'admin' && <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300"><Shield className="h-3 w-3" /></span>}
									</span>
								</td>
								<td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{u.email}</td>
								<td className="px-3 py-2">
									<div className="flex flex-col gap-1">
										<StatusBadge status={u.status || 'normal'} />
										{!u.verified && <span className="text-[10px] text-amber-600">未验证</span>}
									</div>
								</td>
								<td className="px-3 py-2 hidden lg:table-cell text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</td>
								<td className="px-3 py-2">
									<div className="flex flex-wrap items-center gap-1">
										<button title="编辑" onClick={() => openEdit(u)} className="p-1 rounded hover:bg-sky-100 text-sky-600 transition-colors text-xs px-2 py-0.5 border border-sky-200 rounded-lg">编辑</button>
										{!u.verified && <button title="手动验证" onClick={() => manualVerify(u.id)} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors text-xs px-2 py-0.5 border border-emerald-200 rounded-lg">验证</button>}
										{(u.status || 'normal') !== 'banned'
											? <button title="封禁" onClick={() => doAction(u.id, 'ban')} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"><Ban className="h-3.5 w-3.5" /></button>
											: <button title="解封" onClick={() => doAction(u.id, 'unban')} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"><CheckCircle className="h-3.5 w-3.5" /></button>
										}
										<button title="隐藏所有内容" onClick={() => doAction(u.id, 'hide')} className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"><EyeOff className="h-3.5 w-3.5" /></button>
										{currentUserId !== u.id && <button title="删除用户" onClick={() => deleteUser(u.id)} className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>共 {total} 条</span>
				<div className="flex items-center gap-1">
					<Button size="sm" variant="outline" disabled={currentPage <= 1 || loading} onClick={() => load(offset - limit)}><ChevronLeft className="h-4 w-4" /></Button>
					<span className="px-2">{currentPage} / {totalPages}</span>
					<Button size="sm" variant="outline" disabled={currentPage >= totalPages || loading} onClick={() => load(offset + limit)}><ChevronRight className="h-4 w-4" /></Button>
				</div>
			</div>

			{/* 编辑弹窗 */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>编辑用户</DialogTitle>
						<DialogDescription>修改用户名 / 邮箱 / 头像 / 密码</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2"><Label>用户名</Label><Input value={editUsername} onChange={e => setEditUsername(e.target.value)} maxLength={20} /></div>
						<div className="grid gap-2"><Label>邮箱</Label><Input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" /></div>
						<div className="grid gap-2"><Label>头像 URL</Label><Input value={editAvatarUrl} onChange={e => setEditAvatarUrl(e.target.value)} /></div>
						<div className="grid gap-2"><Label>新密码 <span className="text-muted-foreground text-xs">(留空不变)</span></Label><Input value={editPassword} onChange={e => setEditPassword(e.target.value)} type="password" /></div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
						<Button onClick={saveEdit} disabled={editLoading}>{editLoading ? '保存中…' : '保存'}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* 确认弹窗 */}
			<ConfirmDialog
				open={confirmOpen}
				title={confirmConfig?.title || ''}
				description={confirmConfig?.desc}
				confirmLabel="确认"
				onConfirm={() => { setConfirmOpen(false); confirmConfig?.onOk(); }}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}

// ─── 分类管理 Tab ─────────────────────────────────────────────
function CategoriesTab() {
	const [categories, setCategories] = React.useState<Category[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [newName, setNewName] = React.useState('');
	const [editId, setEditId] = React.useState<number | null>(null);
	const [editName, setEditName] = React.useState('');

	const load = React.useCallback(async () => {
		try { setCategories(await apiFetch<Category[]>('/categories')); } catch {}
	}, []);

	React.useEffect(() => { load(); }, [load]);

	const toast = useToast();
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [pendingDelId, setPendingDelId] = React.useState<number | null>(null);

	async function create() {
		if (!newName.trim()) return;
		setLoading(true);
		try { await apiFetch('/admin/categories', { method: 'POST', headers: getSecurityHeaders('POST'), body: JSON.stringify({ name: newName }) }); setNewName(''); await load(); toast('success', '分类已创建'); } catch (e: any) { toast('error', e?.message || '创建失败'); }
		setLoading(false);
	}

	async function update(id: number) {
		if (!editName.trim()) return;
		setLoading(true);
		try { await apiFetch(`/admin/categories/${id}`, { method: 'PUT', headers: getSecurityHeaders('PUT'), body: JSON.stringify({ name: editName }) }); setEditId(null); await load(); toast('success', '分类已更新'); } catch (e: any) { toast('error', e?.message || '更新失败'); }
		setLoading(false);
	}

	function del(id: number) {
		setPendingDelId(id);
		setConfirmOpen(true);
	}

	async function execDel(id: number) {
		setLoading(true);
		try { await apiFetch(`/admin/categories/${id}`, { method: 'DELETE', headers: getSecurityHeaders('DELETE') }); await load(); toast('success', '分类已删除'); } catch (e: any) { toast('error', e?.message || '删除失败'); }
		setLoading(false);
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="新分类名称" className="max-w-xs" onKeyDown={e => e.key === 'Enter' && create()} />
				<Button onClick={create} disabled={loading || !newName.trim()}>添加</Button>
			</div>
			<div className="space-y-2">
				{categories.map(c => (
					<div key={c.id} className="flex items-center justify-between rounded-xl border border-sakura/20 px-4 py-2.5 bg-card hover:bg-sakura/5 transition-colors">
						{editId === c.id
							? <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 max-w-xs" onKeyDown={e => e.key === 'Enter' && update(c.id)} />
							: <span className="font-medium">{c.name}</span>
						}
						<div className="flex gap-2">
							{editId === c.id ? (
								<>
									<Button size="sm" variant="outline" onClick={() => update(c.id)} disabled={loading}>保存</Button>
									<Button size="sm" variant="outline" onClick={() => setEditId(null)}>取消</Button>
								</>
							) : (
								<Button size="sm" variant="outline" onClick={() => { setEditId(c.id); setEditName(c.name); }}>编辑</Button>
							)}
							<Button size="sm" variant="destructive" onClick={() => del(c.id)}>删除</Button>
						</div>
					</div>
				))}
			{categories.length === 0 && <p className="text-sm text-muted-foreground">暂无分类</p>}
		</div>
		<ConfirmDialog
			open={confirmOpen}
			title="删除分类"
			description="确定删除此分类？删除后该分类下的帖子将变为未分类。"
			confirmLabel="删除"
			onConfirm={() => { setConfirmOpen(false); if (pendingDelId !== null) execDel(pendingDelId); }}
			onCancel={() => setConfirmOpen(false)}
		/>
		</div>
	);
}

// ─── 开关组件 ────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
	return (
		<label className="flex items-center gap-3 cursor-pointer group">
			<div className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`} onClick={() => onChange(!checked)}>
				<div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
			</div>
			<span className="text-sm group-hover:text-foreground transition-colors">{label}</span>
		</label>
	);
}

// ─── 存储清理 Tab ────────────────────────────────────────────
function StorageCleanupTab() {
	const toast = useToast();
	type AnalyzeResult = {
		total_files: number;
		used_files: number;
		orphan_files?: number;
		orphaned_files: number;
		orphans: string[];
	};
	const [analyzing, setAnalyzing] = React.useState(false);
	const [cleaning, setCleaning] = React.useState(false);
	const [result, setResult] = React.useState<AnalyzeResult | null>(null);
	const [confirmOpen, setConfirmOpen] = React.useState(false);

	const analyze = async () => {
		setAnalyzing(true);
		setResult(null);
		try {
			const data = await apiFetch<AnalyzeResult>('/admin/cleanup/analyze', {
				headers: getSecurityHeaders('GET'),
			});
			setResult(data);
		} catch (e: any) {
			toast('error', e?.message || '分析失败，请检查存储配置');
		} finally {
			setAnalyzing(false);
		}
	};

	const executeCleanup = async () => {
		if (!result || result.orphans.length === 0) return;
		setCleaning(true);
		try {
			await apiFetch('/admin/cleanup/execute', {
				method: 'POST',
				headers: { ...getSecurityHeaders('POST'), 'Content-Type': 'application/json' },
				body: JSON.stringify({ orphans: result.orphans }),
			});
			toast('success', `已成功清理 ${result.orphans.length} 个未使用文件`);
			setResult(null);
		} catch (e: any) {
			toast('error', e?.message || '清理失败');
		} finally {
			setCleaning(false);
			setConfirmOpen(false);
		}
	};

	return (
		<div className="space-y-5">
			{/* 说明卡片 */}
			<div className="rounded-2xl border border-sky-200 bg-sky-50/60 dark:bg-sky-900/20 dark:border-sky-700/40 p-4 flex gap-3">
				<Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
				<div className="text-sm text-sky-800 dark:text-sky-200 space-y-1">
					<p className="font-medium">存储空间清理</p>
					<p className="text-xs opacity-80">扫描 R2/S3 存储中所有文件，找出未被任何帖子、评论或用户头像引用的孤立文件并删除，释放存储空间。</p>
					<p className="text-xs opacity-70">⚠️ 删除操作不可逆，请在分析后仔细确认再执行清理。</p>
				</div>
			</div>

			{/* 操作按钮 */}
			<div className="flex items-center gap-3">
				<Button onClick={analyze} disabled={analyzing || cleaning} className="gap-2">
					{analyzing
						? <><RefreshCw className="h-4 w-4 animate-spin" />分析中…</>
						: <><HardDrive className="h-4 w-4" />开始分析</>}
				</Button>
				{result && result.orphans.length > 0 && (
					<Button
						variant="destructive"
						onClick={() => setConfirmOpen(true)}
						disabled={cleaning}
						className="gap-2"
					>
						{cleaning
							? <><RefreshCw className="h-4 w-4 animate-spin" />清理中…</>
							: <><Trash2 className="h-4 w-4" />清理 {result.orphans.length} 个文件</>}
					</Button>
				)}
			</div>

			{/* 分析结果 */}
			{result && (
				<div className="space-y-4">
					{/* 统计卡片 */}
					<div className="grid gap-3 sm:grid-cols-3">
						{[
							{ label: '存储文件总数', value: result.total_files, icon: '🗂️', color: 'from-sky/20 to-sky/5' },
							{ label: '已使用文件', value: result.used_files, icon: '✅', color: 'from-emerald-500/20 to-emerald-500/5' },
							{ label: '未使用文件', value: result.orphaned_files, icon: '🗑️', color: result.orphaned_files > 0 ? 'from-red-500/20 to-red-500/5' : 'from-muted/40 to-muted/10' },
						].map(s => (
							<div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} border border-sakura/20 p-4`}>
								<div className="text-2xl mb-1">{s.icon}</div>
								<div className="text-2xl font-bold font-display">{s.value}</div>
								<div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
							</div>
						))}
					</div>

					{/* 孤立文件列表 */}
					{result.orphans.length === 0 ? (
						<div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-900/20 dark:border-emerald-700/40 p-4 flex items-center gap-3">
							<CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
							<span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">太棒了！存储中没有未使用的文件 🎉</span>
						</div>
					) : (
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">未使用文件列表（共 {result.orphans.length} 个）：</p>
							<div className="rounded-xl border border-border bg-muted/30 max-h-64 overflow-y-auto">
								<table className="w-full text-xs">
									<tbody>
										{result.orphans.map((key, i) => (
											<tr key={key} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}>
												<td className="px-3 py-1.5 font-mono text-muted-foreground break-all">{key}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}

			{/* 确认弹窗 */}
			<ConfirmDialog
				open={confirmOpen}
				title="确认清理未使用文件"
				description={`即将永久删除 ${result?.orphans.length ?? 0} 个未被引用的文件，此操作不可撤销，请确认继续。`}
				confirmLabel="确认清理"
				confirmVariant="destructive"
				onConfirm={executeCleanup}
				onCancel={() => setConfirmOpen(false)}
			/>
		</div>
	);
}

// ─── 设置分组标题 ─────────────────────────────────────────────
function SettingSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 pb-2 border-b border-sakura/20">
				<span className="text-lg">{icon}</span>
				<h3 className="font-display font-semibold text-base">{title}</h3>
			</div>
			{children}
		</div>
	);
}

// ─── 系统设置 Tab ─────────────────────────────────────────────
function SystemSettingsTab() {
	const [form, setForm] = React.useState<Record<string, any>>({
		// 功能开关
		turnstile_enabled: false,
		notify_on_user_delete: false,
		notify_on_username_change: false,
		notify_on_avatar_change: false,
		notify_on_manual_verify: false,
		// 基础信息
		site_title: '',
		site_description: '',
site_primary_color: '#f43f8e',

		site_favicon_url: '',
		// 外观
		site_bg_image: '',
		site_bg_opacity: '1',
		site_custom_css: '',
		site_custom_js: '',
		// 内容
		site_announcement: '',
		site_footer_html: '',
		site_icp: '',
		// 协议
		site_terms: DEFAULT_TERMS,
		site_privacy: DEFAULT_PRIVACY,
		// 安全
		site_allowed_regions: '',
		site_blocked_regions: '',
		site_post_rate_limit: ',
		site_comment_rate_limit: '',
		site_keyword_filter: '',
	});
	const [loading, setLoading] = React.useState(false);
	const [fetchLoading, setFetchLoading] = React.useState(true);
	const [saved, setSaved] = React.useState(false);
	const [error, setError] = React.useState('');
	const [uploadingFavicon, setUploadingFavicon] = React.useState(false);
	const [uploadingBg, setUploadingBg] = React.useState(false);
	// 当前激活的分组
	const [activeSection, setActiveSection] = React.useState<'basic' | 'appearance' | 'content' | 'protocol' | 'security' | 'notify'>('basic');

	React.useEffect(() => {
		setFetchLoading(true);
		apiFetch<any>('/admin/settings', { headers: getSecurityHeaders('GET') })
			.then(data => {
				setForm(prev => ({
					...prev,
					turnstile_enabled: !!data.turnstile_enabled,
					notify_on_user_delete: !!data.notify_on_user_delete,
					notify_on_username_change: !!data.notify_on_username_change,
					notify_on_avatar_change: !!data.notify_on_avatar_change,
					notify_on_manual_verify: !!data.notify_on_manual_verify,
					site_title: data.site_title || '',
					site_description: data.site_description || '',
					site_primary_color: data.site_primary_color || '#f43f8e',
					site_favicon_url: data.site_favicon_url || '',
					site_bg_image: data.site_bg_image || '',
					site_bg_opacity: data.site_bg_opacity || '1',
					site_custom_css: data.site_custom_css || '',
					site_custom_js: data.site_custom_js || '',
					site_announcement: data.site_announcement || '',
					site_footer_html: data.site_footer_html || '',
					site_icp: data.site_icp || '',
					site_terms: data.site_terms || DEFAULT_TERMS,
					site_privacy: data.site_privacy || DEFAULT_PRIVACY,
					site_allowed_regions: data.site_allowed_regions || '',
					site_blocked_regions: data.site_blocked_regions || '',
					site_post_rate_limit: data.site_post_rate_limit || '',
					site_comment_rate_limit: data.site_comment_rate_limit || '',
					site_keyword_filter: data.site_keyword_filter || '',
				}));
			})
			.catch(() => setError('加载设置失败'))
			.finally(() => setFetchLoading(false));
	}, []);

	function set(key: string, value: any) {
		setForm(prev => ({ ...prev, [key]: value }));
	}

	const toast = useToast();

	async function uploadImage(file: File, type: 'favicon' | 'bg') {
		type === 'favicon' ? setUploadingFavicon(true) : setUploadingBg(true);
		try {
			// 压缩图片，最大2MB，高压缩模式
			const compressed = await imageCompression(file, {
				maxSizeMB: 2,
				maxWidthOrHeight: 1920,
				useWebWorker: true,
				initialQuality: 0.6,
			});
			const fd = new FormData();
			fd.append('file', compressed, file.name);
			fd.append('type', 'avatar');
			const token = getToken();
			const headers: Record<string, string> = {};
			if (token) headers['Authorization'] = `Bearer ${token}`;
			headers['X-Timestamp'] = Math.floor(Date.now() / 1000).toString();
			headers['X-Nonce'] = crypto.randomUUID();
			const res = await fetch('/api/upload', { method: 'POST', headers, body: fd });
			const data = await res.json() as any;
			if (!res.ok) throw new Error(data?.error || '上传失败');
			if (!data.url) throw new Error('上传成功但未返回图片地址');
			type === 'favicon' ? set('site_favicon_url', data.url) : set('site_bg_image', data.url);
			toast('success', type === 'favicon' ? '图标上传成功' : '背景图上传成功');
		} catch (e: any) { toast('error', e?.message || '上传失败'); }
		type === 'favicon' ? setUploadingFavicon(false) : setUploadingBg(false);
	}

	async function save() {
		setLoading(true);
		setError('');
		try {
			await apiFetch('/admin/settings', {
				method: 'POST',
				headers: getSecurityHeaders('POST'),
				body: JSON.stringify(form)
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} catch (e: any) { setError(e?.message || '保存失败'); }
		setLoading(false);
	}

	const sections = [
		{ id: 'basic',      icon: '🏠', label: '基础信息' },
		{ id: 'appearance', icon: '🎨', label: '外观' },
		{ id: 'content',    icon: '📢', label: '内容' },
		{ id: 'protocol',   icon: '📜', label: '协议' },
		{ id: 'security',   icon: '🔒', label: '安全' },
		{ id: 'notify',     icon: '🔔', label: '通知' },
	] as const;

	if (fetchLoading) {
		return <div className="py-12 text-center text-muted-foreground text-sm">加载中…</div>;
	}

	return (
		<div className="space-y-5">
			{error && <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

			{/* 分组导航 */}
			<div className="flex flex-wrap gap-1.5">
				{sections.map(s => (
					<button
						key={s.id}
						onClick={() => setActiveSection(s.id)}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
							${activeSection === s.id
								? 'bg-gradient-to-r from-sakura/30 to-lavender/30 text-primary border border-sakura/40 shadow-sm'
								: 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
							}`}
					>
						<span>{s.icon}</span>{s.label}
					</button>
				))}
			</div>

			{/* ── 基础信息 ── */}
			{activeSection === 'basic' && (
				<SettingSection icon="🏠" title="基础信息">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="site_title">网站标题</Label>
							<Input id="site_title" value={form.site_title} onChange={e => set('site_title', e.target.value)} placeholder="CForum" />
							<p className="text-xs text-muted-foreground">显示在浏览器标签和导航栏</p>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="site_description">网站介绍</Label>
							<Input id="site_description" value={form.site_description} onChange={e => set('site_description', e.target.value)} placeholder="一个可爱的二次元论坛" />
							<p className="text-xs text-muted-foreground">显示在标题下方</p>
						</div>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="site_primary_color">主体色调</Label>
							<div className="flex items-center gap-2">
								<input
									type="color"
									id="site_primary_color"
									value={form.site_primary_color}
									onChange={e => set('site_primary_color', e.target.value)}
									className="h-9 w-12 rounded-lg border border-border cursor-pointer p-0.5"
								/>
						<Input value={form.site_primary_color} onChange={e => set('site_primary_color', e.target.value)} className="flex-1 font-mono text-sm" placeholder="#f43f8e" />
						</div>
						<p className="text-xs text-muted-foreground">默认 #f43f8e（玫瑰红）</p>
						</div>
						<div className="space-y-1.5">
							<Label>网站图标</Label>
							<div className="flex items-center gap-2">
								{form.site_favicon_url && (
									<img src={form.site_favicon_url} alt="favicon" className="h-8 w-8 rounded object-contain border border-border" />
								)}
								<label className="flex-1 cursor-pointer">
									<div className="flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-dashed border-border hover:border-sakura/60 transition-colors text-sm text-muted-foreground">
										{uploadingFavicon ? '上传中…' : '点击上传图标'}
									</div>
									<input type="file" accept="image/*" className="hidden" disabled={uploadingFavicon}
										onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'favicon'); }} />
								</label>
							</div>
							{form.site_favicon_url && (
								<Input value={form.site_favicon_url} onChange={e => set('site_favicon_url', e.target.value)} placeholder="或直接输入图标 URL" className="text-xs" />
							)}
						</div>
					</div>
				</SettingSection>
			)}

			{/* ── 外观 ── */}
			{activeSection === 'appearance' && (
				<SettingSection icon="🎨" title="外观">
					<div className="space-y-1.5">
						<Label>背景图片</Label>
						<div className="flex items-center gap-2">
							{form.site_bg_image && (
								<img src={form.site_bg_image} alt="bg" className="h-12 w-20 rounded-lg object-cover border border-border shrink-0" />
							)}
							<label className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-dashed border-border hover:border-sakura/60 transition-colors text-sm text-muted-foreground">
									{uploadingBg ? '上传中…' : '点击上传背景图'}
								</div>
								<input type="file" accept="image/*" className="hidden" disabled={uploadingBg}
									onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'bg'); }} />
							</label>
						</div>
						<Input value={form.site_bg_image} onChange={e => set('site_bg_image', e.target.value)} placeholder="或直接输入背景图 URL" className="text-xs" />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_bg_opacity">透明度（内容区域）</Label>
						<div className="flex items-center gap-3">
							<input
								type="range" id="site_bg_opacity" min="0.1" max="1" step="0.05"
								value={form.site_bg_opacity}
								onChange={e => set('site_bg_opacity', e.target.value)}
								className="flex-1 accent-primary"
							/>
							<span className="text-sm font-mono w-10 text-right">{parseFloat(form.site_bg_opacity).toFixed(2)}</span>
						</div>
						<p className="text-xs text-muted-foreground">默认 1.00（不透明），设置小于 1 时背景图才可见</p>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_custom_css">自定义 CSS</Label>
						<textarea
							id="site_custom_css"
							value={form.site_custom_css}
							onChange={e => set('site_custom_css', e.target.value)}
							rows={8}
							placeholder="/* 在此输入自定义 CSS，将注入到所有页面 <head> 中 */"
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y min-h-[120px]"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_custom_js">自定义 JS</Label>
						<textarea
							id="site_custom_js"
							value={form.site_custom_js}
							onChange={e => set('site_custom_js', e.target.value)}
							rows={6}
							placeholder="// 在此输入自定义 JavaScript，将注入到所有页面底部"
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y min-h-[100px]"
						/>
					</div>
				</SettingSection>
			)}

			{/* ── 内容 ── */}
			{activeSection === 'content' && (
				<SettingSection icon="📢" title="内容">
					<div className="space-y-1.5">
						<Label htmlFor="site_announcement">站点公告</Label>
						<textarea
							id="site_announcement"
							value={form.site_announcement}
							onChange={e => set('site_announcement', e.target.value)}
							rows={3}
							placeholder="公告内容，支持 HTML，显示在页面顶部横幅"
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_footer_html">底部信息</Label>
						<textarea
							id="site_footer_html"
							value={form.site_footer_html}
							onChange={e => set('site_footer_html', e.target.value)}
							rows={3}
							placeholder="底部 HTML/纯文本，留空则显示默认 Powered by CForum"
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_icp">备案信息</Label>
						<Input id="site_icp" value={form.site_icp} onChange={e => set('site_icp', e.target.value)} placeholder="京ICP备XXXXXXXX号" />
						<p className="text-xs text-muted-foreground">显示在页面底部，点击跳转至工信部备案查询</p>
					</div>
				</SettingSection>
			)}

			{/* ── 协议 ── */}
			{activeSection === 'protocol' && (
				<SettingSection icon="📜" title="用户协议与隐私政策">
					<p className="text-xs text-muted-foreground">以下内容将在注册页面展示，用户必须勾选同意后才能注册。</p>
					<div className="space-y-1.5">
						<Label htmlFor="site_terms">用户协议</Label>
						<textarea
							id="site_terms"
							value={form.site_terms}
							onChange={e => set('site_terms', e.target.value)}
							rows={12}
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y min-h-[200px]"
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_privacy">隐私政策</Label>
						<textarea
							id="site_privacy"
							value={form.site_privacy}
							onChange={e => set('site_privacy', e.target.value)}
							rows={12}
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y min-h-[200px]"
						/>
					</div>
				</SettingSection>
			)}

			{/* ── 安全 ── */}
			{activeSection === 'security' && (
				<SettingSection icon="🔒" title="安全">
				<div className="space-y-1.5">
						<Label htmlFor="site_allowed_regions">允许访问区域（白名单）</Label>
						<Input
							id="site_allowed_regions"
							value={form.site_allowed_regions}
							onChange={e => set('site_allowed_regions', e.target.value)}
							placeholder="CN（多个用英文逗号分隔，留空则不限制）"
						/>
						<p className="text-xs text-muted-foreground">使用 ISO 3166-1 alpha-2 国家代码。配置后，<strong>仅允许</strong>列表内的国家访问，其余全部返回 403（包括无法识别来源的请求）</p>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_blocked_regions">禁止访问区域（黑名单）</Label>
						<Input
							id="site_blocked_regions"
							value={form.site_blocked_regions}
							onChange={e => set('site_blocked_regions', e.target.value)}
							placeholder="CN, US（多个用英文逗号分隔）"
						/>
					<p className="text-xs text-muted-foreground">使用 ISO 3166-1 alpha-2 国家代码，命中则直接返回 403 禁止访问页面（无法识别来源时不拦截）</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="site_post_rate_limit">发帖频率限制</Label>
							<Input
								id="site_post_rate_limit"
								value={form.site_post_rate_limit}
								onChange={e => set('site_post_rate_limit', e.target.value)}
								placeholder='{"count":5,"window":1,"unit":"hour"}'
								className="font-mono text-xs"
							/>
							<p className="text-xs text-muted-foreground">JSON 格式：count（次数）、window（时间窗口数量）、unit（minute/hour/day）</p>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="site_comment_rate_limit">评论频率限制</Label>
							<Input
								id="site_comment_rate_limit"
								value={form.site_comment_rate_limit}
								onChange={e => set('site_comment_rate_limit', e.target.value)}
								placeholder='{"count":10,"window":1,"unit":"hour"}'
								className="font-mono text-xs"
							/>
							<p className="text-xs text-muted-foreground">同上，留空则不限制</p>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="site_keyword_filter">关键词过滤</Label>
						<textarea
							id="site_keyword_filter"
							value={form.site_keyword_filter}
							onChange={e => set('site_keyword_filter', e.target.value)}
							rows={6}
							placeholder={"每行一个关键词\n包含关键词的帖子/评论将被自动锁定（仅作者可见）"}
							className="w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-sakura focus:shadow-[0_0_0_3px_rgba(255,183,197,0.4)] resize-y min-h-[120px]"
						/>
						<p className="text-xs text-muted-foreground">每行一个关键词，不区分大小写，命中后内容自动锁定并提示用户</p>
					</div>
				</SettingSection>
			)}

			{/* ── 通知 ── */}
			{activeSection === 'notify' && (
				<SettingSection icon="🔔" title="通知设置">
					<div className="space-y-3">
						<Toggle checked={!!form.turnstile_enabled} onChange={v => set('turnstile_enabled', v)} label="启用 Cloudflare Turnstile 验证码" />
						<Toggle checked={!!form.notify_on_user_delete} onChange={v => set('notify_on_user_delete', v)} label="删除账号时通知用户" />
						<Toggle checked={!!form.notify_on_username_change} onChange={v => set('notify_on_username_change', v)} label="修改用户名时通知用户" />
						<Toggle checked={!!form.notify_on_avatar_change} onChange={v => set('notify_on_avatar_change', v)} label="修改头像时通知用户" />
						<Toggle checked={!!form.notify_on_manual_verify} onChange={v => set('notify_on_manual_verify', v)} label="手动验证通过时通知用户" />
					</div>
				</SettingSection>
			)}

			{/* 保存按钮 */}
			<div className="flex items-center gap-3 pt-2 border-t border-sakura/20">
				<Button onClick={save} disabled={loading} className="px-8">
					{saved ? '✅ 已保存！' : loading ? '保存中…' : '💾 保存设置'}
				</Button>
				{saved && <span className="text-sm text-emerald-600 animate-fade-in">设置已成功保存 🎉</span>}
			</div>
		</div>
	);
}

// ─── 主页面 ───────────────────────────────────────────────────
export function AdminPage() {
	const token = getToken();
	const user = React.useMemo(() => getUser(), [token]);
	const isAdmin = user?.role === 'admin';
	const [tab, setTab] = React.useState<AdminTab>('overview');
	const [stats, setStats] = React.useState<{ users: number; posts: number; comments: number } | null>(null);
	const [toasts, setToasts] = React.useState<Toast[]>([]);
	const addToast = React.useCallback((type: ToastType, message: string) => {
		const id = Date.now();
		setToasts(prev => [...prev, { id, type, message }]);
		setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
	}, []);

	React.useEffect(() => {
		if (!token) { window.location.href = '/login'; return; }
	}, [token]);

	React.useEffect(() => {
		if (!isAdmin) return;
		apiFetch<any>('/admin/stats', { headers: getSecurityHeaders('GET') })
			.then(s => setStats(s)).catch(() => {});
	}, [isAdmin]);

	if (!isAdmin) {
		return (
			<PageShell>
				<Card><CardContent className="py-12 text-center text-muted-foreground">🚫 无权限访问管理后台</CardContent></Card>
			</PageShell>
		);
	}

	const navItems: Array<{ id: AdminTab; icon: React.ReactNode; label: string }> = [
		{ id: 'overview',    icon: <BarChart2 className="h-4 w-4" />,     label: '概览' },
		{ id: 'posts',       icon: <FileText className="h-4 w-4" />,      label: '帖子管理' },
		{ id: 'comments',    icon: <MessageSquare className="h-4 w-4" />, label: '评论管理' },
		{ id: 'users',       icon: <Users className="h-4 w-4" />,         label: '用户管理' },
		{ id: 'categories',  icon: <Tag className="h-4 w-4" />,           label: '分类管理' },
		{ id: 'settings',    icon: <Settings className="h-4 w-4" />,      label: '系统设置' },
		{ id: 'storage',     icon: <HardDrive className="h-4 w-4" />,     label: '存储清理' },
	];

	return (
		<ToastContext.Provider value={addToast}>
		<PageShell>
			<div className="flex flex-col gap-6">
				{/* 页头 */}
				<div className="flex items-center gap-3">
				<div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#f43f8e] to-[#a855f7] flex items-center justify-center text-white shadow-anime">
						<Shield className="h-5 w-5" />
					</div>
					<div>
						<h1 className="font-display text-2xl font-bold bg-gradient-to-r from-[#f43f8e] to-[#a855f7] bg-clip-text text-transparent">管理后台</h1>
						<p className="text-xs text-muted-foreground">欢迎回来，{user?.username} ✨</p>
					</div>
				</div>

				<div className="flex flex-col md:flex-row gap-4">
					{/* 侧边栏 */}
					<nav className="md:w-44 shrink-0">
						<div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
							{navItems.map(item => (
								<button
									key={item.id}
									onClick={() => setTab(item.id)}
									className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
										${tab === item.id
											? 'bg-gradient-to-r from-sakura/20 to-lavender/20 text-primary border border-sakura/30 shadow-sm'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
										}`}
								>
									{item.icon}
									{item.label}
								</button>
							))}
						</div>
					</nav>

					{/* 内容区 */}
					<div className="flex-1 min-w-0">
				<Card className="shadow-lg border-sakura/20 overflow-hidden">
					<CardHeader className="rounded-t-2xl bg-gradient-to-r from-sakura/10 via-lavender/10 to-sky/10 border-b border-sakura/20 pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									{navItems.find(n => n.id === tab)?.icon}
									{navItems.find(n => n.id === tab)?.label}
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								{tab === 'overview' && (
									<div className="space-y-4">
										<div className="grid gap-4 sm:grid-cols-3">
											{[
												{ label: '用户总数', value: stats?.users, icon: '👥', color: 'from-sakura/20 to-sakura/5' },
												{ label: '帖子总数', value: stats?.posts, icon: '📝', color: 'from-lavender/20 to-lavender/5' },
												{ label: '评论总数', value: stats?.comments, icon: '💬', color: 'from-sky/20 to-sky/5' },
											].map(s => (
							<div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} border border-sakura/20 p-4 shadow-md hover:shadow-lg transition-shadow`}>
													<div className="text-2xl mb-1">{s.icon}</div>
													<div className="text-2xl font-bold font-display">{s.value ?? '—'}</div>
													<div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
												</div>
											))}
										</div>
										<p className="text-sm text-muted-foreground">使用左侧导航管理帖子、评论、用户和系统设置。</p>
									</div>
								)}
						{tab === 'posts'      && <PostsTab />}
						{tab === 'comments'   && <CommentsTab />}
						{tab === 'users'      && <UsersTab currentUserId={user?.id} />}
						{tab === 'categories' && <CategoriesTab />}
						{tab === 'settings'   && <SystemSettingsTab />}
						{tab === 'storage'    && <StorageCleanupTab />}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</PageShell>
		<ToastContainer toasts={toasts} onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))} />
		</ToastContext.Provider>
	);
}
