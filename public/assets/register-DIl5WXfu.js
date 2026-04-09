import{u as O,r as t,j as e,I as x,B as E,c as H,m as J}from"./api-DggwOxTj.js";import{T as V}from"./turnstile-CF_YuvH6.js";import{A as W,a as Y}from"./auth-shell-ADLs6C1U.js";import{L as h}from"./label-CWOeJH4v.js";import{u as R}from"./use-i18n-DBhhKV-N.js";const G=`用户协议

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

继续注册即表示您同意以上条款。`,Q=`隐私政策

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

使用本站即表示您同意本隐私政策。`;function L({title:a,content:s,onClose:n}){const{t:i}=R();return e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4",children:[e.jsx("div",{className:"absolute inset-0 bg-black/40 backdrop-blur-sm",onClick:n}),e.jsxs("div",{className:"relative z-10 w-full max-w-lg max-h-[70vh] flex flex-col rounded-2xl border border-sakura/30 bg-background shadow-2xl",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 py-4 border-b border-sakura/20 bg-gradient-to-r from-sakura/10 to-lavender/10 rounded-t-2xl",children:[e.jsx("h3",{className:"font-display font-bold text-base",children:a}),e.jsx("button",{type:"button",onClick:n,className:"text-muted-foreground hover:text-foreground transition-colors text-lg leading-none",children:"✕"})]}),e.jsx("div",{className:"overflow-y-auto flex-1 p-5",children:e.jsx("pre",{className:"text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans",children:s})}),e.jsx("div",{className:"px-5 py-3 border-t border-sakura/20",children:e.jsx(E,{size:"sm",className:"w-full",onClick:n,children:i.iHaveRead})})]})]})}function X(){const{config:a}=O(),{t:s}=R(),[n,i]=t.useState(""),[p,g]=t.useState(""),[f,b]=t.useState(""),[j,c]=t.useState(""),[_,v]=t.useState(0),[y,k]=t.useState(!1),[N,l]=t.useState(""),[w,S]=t.useState(""),[d,F]=t.useState(!1),[u,I]=t.useState(!1),[K,C]=t.useState(!1),[U,T]=t.useState(!1),q=!!a?.turnstile_enabled,P=a?.turnstile_site_key||"",A=q&&!!P,z=a?.site_terms||G,B=a?.site_privacy||Q;async function D(r){if(r.preventDefault(),l(""),S(""),!d||!u){l(s.mustAgree);return}if(A&&!j){l(s.completeCaptcha);return}k(!0);try{const o=await fetch("/api/register",{method:"POST",headers:H("POST"),body:JSON.stringify({email:n,username:p,password:f,"cf-turnstile-response":j})}),M=await o.json();if(!o.ok)throw c(""),v(m=>m+1),new Error(M?.error||s.registerFailed);S(s.registerSuccess),i(""),g(""),b(""),c(""),v(m=>m+1)}catch(o){l(String(o?.message||o))}finally{k(!1)}}return e.jsxs(W,{children:[K&&e.jsx(L,{title:s.termsTitle,content:z,onClose:()=>C(!1)}),U&&e.jsx(L,{title:s.privacyTitle,content:B,onClose:()=>T(!1)}),e.jsx(Y,{children:e.jsxs("div",{className:"p-8",children:[e.jsxs("div",{className:"text-center mb-8",children:[e.jsx("div",{className:"text-4xl mb-3 animate-bounce-gentle",children:"✨"}),e.jsx("h1",{className:"font-display text-2xl font-bold bg-gradient-to-r from-[#e879a0] to-[#a855f7] bg-clip-text text-transparent",children:s.joinUs}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:s.registerSubtitle})]}),e.jsxs("form",{className:"space-y-5",onSubmit:D,children:[N?e.jsx("div",{className:"rounded-xl border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive",children:N}):null,w?e.jsxs("div",{className:"rounded-xl border border-mint/50 bg-mint/10 p-3 text-sm text-green-700 dark:text-green-300",children:["🎉 ",w]}):null,e.jsxs("div",{className:"space-y-2",children:[e.jsxs(h,{htmlFor:"register-username",children:[s.username," ",e.jsx("span",{className:"text-muted-foreground text-xs",children:s.usernameMaxLen})]}),e.jsx(x,{id:"register-username",name:"username",type:"text",maxLength:20,value:p,onChange:r=>g(r.target.value),placeholder:s.nickname,required:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(h,{htmlFor:"register-email",children:s.email}),e.jsx(x,{id:"register-email",name:"email",type:"email",autoComplete:"email",value:n,onChange:r=>i(r.target.value),placeholder:"your@email.com",required:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(h,{htmlFor:"register-password",children:[s.password," ",e.jsx("span",{className:"text-muted-foreground text-xs",children:s.passwordLen})]}),e.jsx(x,{id:"register-password",name:"password",type:"password",autoComplete:"new-password",value:f,onChange:r=>b(r.target.value),placeholder:"••••••••",required:!0})]}),e.jsxs("div",{className:"space-y-3 rounded-xl border border-sakura/20 bg-sakura/5 p-3",children:[e.jsxs("label",{className:"flex items-start gap-2.5 cursor-pointer group",children:[e.jsx("input",{type:"checkbox",className:"mt-0.5 h-4 w-4 rounded border-sakura/40 accent-pink-500 cursor-pointer",checked:d,onChange:r=>F(r.target.checked)}),e.jsxs("span",{className:"text-sm text-muted-foreground leading-relaxed",children:[s.agreeTerms," ",e.jsx("button",{type:"button",className:"text-primary hover:underline font-medium",onClick:()=>C(!0),children:s.termsLink})]})]}),e.jsxs("label",{className:"flex items-start gap-2.5 cursor-pointer group",children:[e.jsx("input",{type:"checkbox",className:"mt-0.5 h-4 w-4 rounded border-sakura/40 accent-pink-500 cursor-pointer",checked:u,onChange:r=>I(r.target.checked)}),e.jsxs("span",{className:"text-sm text-muted-foreground leading-relaxed",children:[s.agreeTerms," ",e.jsx("button",{type:"button",className:"text-primary hover:underline font-medium",onClick:()=>T(!0),children:s.privacyLink})]})]})]}),e.jsx(V,{enabled:A,siteKey:P,onToken:c,resetKey:_}),e.jsx(E,{className:"w-full",type:"submit",disabled:y||!d||!u,children:y?s.registering:s.registerBtn}),e.jsx("div",{className:"text-sm text-center pt-1",children:e.jsx("a",{className:"text-muted-foreground hover:text-primary transition-colors hover:underline",href:"/login",children:s.hasAccount})})]})]})})]})}J("root",e.jsx(X,{}));
