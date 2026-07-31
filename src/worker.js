function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'"').replace(/'/g,'&#39;');
}

function parseId(raw) {
  const last = String(raw).split('/').pop();
  const i = last.lastIndexOf('.');
  return i > 0 ? { id: last.slice(0, i), ext: last.slice(i + 1) } : { id: last, ext: 'png' };
}

// ─── 博客首页 ───
function blogHtml() {
  return `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>碎记 · 个人博客</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB",serif;color:#3c3c3c;background:#faf9f8;line-height:1.9;font-size:15px}
.c{max-width:680px;margin:0 auto;padding:0 20px}
.h{padding:56px 0 10px;border-bottom:1px solid #e8e6e1;margin-bottom:36px}
.h h1{font-size:26px;font-weight:700;color:#1a1a1a;letter-spacing:-.3px}
.h .d{margin-top:6px;font-size:13px;color:#888}
.nav{margin-top:14px;padding-bottom:14px;display:flex;gap:20px}
.nav a{font-size:13px;color:#888;text-decoration:none;transition:color .15s}
.nav a:hover{color:#1a1a1a}
.p{padding:24px 0;border-bottom:1px solid #eee}
.p:last-of-type{border-bottom:none}
.p .dt{font-size:12px;color:#aaa;font-family:monospace;margin-bottom:4px}
.p h2{font-size:18px;font-weight:600}
.p h2 a{color:#1a1a1a;text-decoration:none}
.p h2 a:hover{color:#d44}
.p .ex{font-size:14px;color:#666;margin-top:6px}
.foot{text-align:center;padding:48px 0 56px;font-size:12px;color:#aaa}
.foot a{color:#888;text-decoration:none}
.foot a:hover{color:#d44}
@media(max-width:600px){.h{padding:36px 0 10px}.h h1{font-size:22px}}
</style></head><body><div class="c">
<header class="h"><h1>碎记</h1><div class="d">埋头写代码，偶尔写写字</div>
<nav class="nav"><a href="/">首页</a><a href="/">文章</a><a href="/">关于</a></nav></header>
<main>
<div class="p"><div class="dt">2026-07-31</div><h2><a href="/">博客上线</a></h2>
<div class="ex">用 Cloudflare 搭了个个人站点，博客 + 图片分享功能，免费又好用。</div></div>
<div class="p"><div class="dt">2026-07-30</div><h2><a href="/">Cloudflare Workers 部署指南</a></h2>
<div class="ex">Git 推送即部署，自动 HTTPS，全球 CDN，零成本建站方案。</div></div>
<div class="p"><div class="dt">2026-07-28</div><h2><a href="/">图片分享防封方案</a></h2>
<div class="ex">用中间页中转，避免 QQ / 微信直接检测图片链接导致封禁。</div></div>
</main>
<footer class="foot"><p>&copy; 2026 · <a href="/">碎记</a> · Powered by Cloudflare Workers</p></footer>
</div></body></html>`;
}

// ─── 按钮页（QQ 防封） ───
function buttonHtml(viewPath) {
  const h = escapeHtml(viewPath);
  return `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,noarchive">
<title>图片分享</title><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
background:linear-gradient(160deg,#f5f7fa,#e8edf3);display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(15,23,42,.10);padding:48px 40px;max-width:400px;width:calc(100%-40px);text-align:center}
.logo{width:56px;height:56px;margin:0 auto 20px;border-radius:14px;background:linear-gradient(135deg,#0297f8,#7cc4ff);
display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:800}
h1{font-size:20px;color:#1e293b;margin-bottom:10px;font-weight:700}
p{font-size:13px;color:#64748b;line-height:1.6;margin-bottom:28px}
.btn{display:inline-block;background:#0297f8;color:#fff;font-size:15px;font-weight:600;text-decoration:none;
padding:13px 38px;border-radius:999px;transition:background .18s ease,transform .12s ease;box-shadow:0 6px 20px rgba(2,151,248,.28)}
.btn:hover{background:#0284e0;transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.foot{margin-top:26px;font-size:11px;color:#94a3b8}
</style></head><body><div class="card">
<div class="logo"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
<h1>图片分享</h1><p>内容通过安全通道分享，点击下方按钮查看图片</p>
<a class="btn" href="${h}" rel="nofollow noopener">点击查看图片</a>
<div class="foot">Powered by URUSAI!</div></div></body></html>`;
}

// ─── 图片展示页（自适应 + 留白） ───
function viewHtml(imageUrl, rawUrl) {
  const src = escapeHtml(imageUrl), href = escapeHtml(rawUrl);
  return `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,noarchive">
<title>图片查看</title><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
background:#0f1419;display:flex;flex-direction:column;min-height:100vh}
.stage{flex:1;display:flex;align-items:center;justify-content:center;padding:5vh 5vw}
.frame{display:flex;align-items:center;justify-content:center;max-width:100%;max-height:100%}
.frame img{display:block;max-width:100%;max-height:85vh;width:auto;height:auto;object-fit:contain;
border-radius:6px;box-shadow:0 8px 40px rgba(0,0,0,.6);background:#0f1419}
.bar{flex:none;padding:16px 20px;text-align:center;background:rgba(15,20,25,.8)}
.bar a{color:#7dd3fc;font-size:12px;text-decoration:none;opacity:.85;transition:opacity .15s}
.bar a:hover{opacity:1;text-decoration:underline}
.bar .dot{color:#334155;margin:0 8px}
.bar .hint{color:#64748b;font-size:12px}
@media(max-width:600px){.stage{padding:3vh 3vw}.frame img{max-height:75vh}}
</style></head><body>
<div class="stage"><div class="frame"><img src="${src}" alt="image" loading="lazy" decoding="async"></div></div>
<div class="bar"><a href="${href}" target="_blank" rel="noopener nofollow">查看原图</a><span class="dot">·</span><span class="hint">图片由 URUSAI! 提供</span></div>
</body></html>`;
}

// ─── Worker 入口 ───
export default {
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // / → 博客首页
    if (path === '/' || path === '/index.html') {
      return new Response(blogHtml(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // /v/:id/img → 图片展示页
    const imgMatch = path.match(/^\/v\/(.+?)\/img$/);
    if (imgMatch) {
      const { id, ext } = parseId(imgMatch[1]);
      const imageUrl = `https://i.urusai.cc/${encodeURIComponent(id)}`;
      const rawUrl = `https://i.urusai.cc/${encodeURIComponent(id)}.${encodeURIComponent(ext)}`;
      return new Response(viewHtml(imageUrl, rawUrl), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, noarchive',
        },
      });
    }

    // /v/:id → 按钮页
    const btnMatch = path.match(/^\/v\/([^/]+)$/);
    if (btnMatch) {
      const viewPath = path + '/img';
      return new Response(buttonHtml(viewPath), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, noarchive',
        },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};