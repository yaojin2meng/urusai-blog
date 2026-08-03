/**
 * urusai-blog — Personal blog with image viewer
 * Enhanced with multi-layer anti-crawler protection:
 *   1. / → Blog home page
 *   2. /v/:id → Blog article style page, no <img> tag, URL encrypted in JS
 *   3. /v/:id/img → Image display page with decryption
 *   4. QQ/WeChat crawler detection → garbage page + transparent redirect to Baidu
 *   5. Image URL encryption (Base64 + XOR)
 */

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

function encryptPath(path, key) {
  const k = key || 'I';
  const encoded = btoa(unescape(encodeURIComponent(path)));
  let result = '';
  for (let i = 0; i < encoded.length; i++) {
    result += String.fromCharCode(encoded.charCodeAt(i) ^ k.charCodeAt(i % k.length));
  }
  return btoa(result);
}

function isCrawlerUA(ua) {
  const uaLower = (ua || '').toLowerCase();
  return /qq\//.test(uaLower) || /micromessenger/.test(uaLower) ||
         /wechat/.test(uaLower) || /qqbrowser/.test(uaLower) ||
         /mqqbrowser/.test(uaLower) || /qzone/.test(uaLower);
}

function renderGarbagePage() {
  const gibberish = '\u00F7\u2202\u00D7\u2211\u220F\u222B\u00B1\u2260\u2248\u221E\u2208\u2209\u2282\u2283\u2229\u222A\u2286\u2287\u2190\u2191\u2192\u2193\u21D0\u21D2\u21D4\u2660\u2663\u2665\u2666\u2605\u2606\u263A\u263B\u260E\u2622\u2623\u262E\u262F';
  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>.</title><meta name="robots" content="noindex,noarchive">\n<script>/* anti-crawler */</script></head><body style="background:#fff;overflow:hidden;margin:0">\n<div style="display:none">' + gibberish.repeat(50) + '</div>\n<script>\n(function(){var d=document;var b=d.body;for(var i=0;i<200;i++){var p=d.createElement("p");\np.style.cssText="color:#fff;font-size:1px;position:absolute;top:"+i+"px";\np.textContent="' + gibberish.slice(0,20) + '";b.appendChild(p);}\nvar a=d.createElement("a");a.href="https://www.baidu.com";a.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;opacity:0";\nb.appendChild(a);})();\n</script></body></html>';
}

function blogHtml() {
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>碎记 · 个人博客</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB",serif;color:#3c3c3c;background:#faf9f8;line-height:1.9;font-size:15px}.c{max-width:680px;margin:0 auto;padding:0 20px}.h{padding:56px 0 10px;border-bottom:1px solid #e8e6e1;margin-bottom:36px}.h h1{font-size:26px;font-weight:700;color:#1a1a1a;letter-spacing:-.3px}.h .d{margin-top:6px;font-size:13px;color:#888}.nav{margin-top:14px;padding-bottom:14px;display:flex;gap:20px}.nav a{font-size:13px;color:#888;text-decoration:none;transition:color .15s}.nav a:hover{color:#1a1a1a}.p{padding:24px 0;border-bottom:1px solid #eee}.p:last-of-type{border-bottom:none}.p .dt{font-size:12px;color:#aaa;font-family:monospace;margin-bottom:4px}.p h2{font-size:18px;font-weight:600}.p h2 a{color:#1a1a1a;text-decoration:none}.p h2 a:hover{color:#d44}.p .ex{font-size:14px;color:#666;margin-top:6px}.foot{text-align:center;padding:48px 0 56px;font-size:12px;color:#aaa}.foot a{color:#888;text-decoration:none}.foot a:hover{color:#d44}@media(max-width:600px){.h{padding:36px 0 10px}.h h1{font-size:22px}}</style></head><body><div class="c"><header class="h"><h1>碎记</h1><div class="d">埋头写代码，偶尔写写字</div><nav class="nav"><a href="/">首页</a><a href="/archive">文章</a><a href="/about">关于</a></nav></header><main><div class="p"><div class="dt">2026-07-31</div><h2><a href="/">博客上线</a></h2><div class="ex">用 Cloudflare 搭了个个人站点，博客 + 图片分享功能，免费又好用。</div></div><div class="p"><div class="dt">2026-07-30</div><h2><a href="/">Cloudflare Workers 部署指南</a></h2><div class="ex">Git 推送即部署，自动 HTTPS，全球 CDN，零成本建站方案。</div></div><div class="p"><div class="dt">2026-07-28</div><h2><a href="/">图片分享防封方案</a></h2><div class="ex">用中间页中转，避免 QQ / 微信直接检测图片链接导致封禁。</div></div></main><footer class="foot"><p>&copy; 2026 · <a href="/">碎记</a> · Powered by Cloudflare Workers</p></footer></div></body></html>';
}

function buttonHtml(viewPath, ua) {
  if (isCrawlerUA(ua)) return renderGarbagePage();
  const h = escapeHtml(viewPath);
  const encryptedPath = encryptPath(viewPath, 'Ih');
  const xorKey = 'Ih';
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,noarchive"><title>光影之间 - 一张照片的故事</title><style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Lantinghei SC","Microsoft YaHei","Hiragino Sans GB","Noto Sans CJK SC",sans-serif;background:#f5f5f5;color:#1a1a1a;line-height:1.6}.wrapper{max-width:780px;margin:0 auto;padding:0 20px}.site-header{background:#fff;border-bottom:1px solid #e8e8e8;padding:16px 0;position:sticky;top:0;z-index:100}.site-header .wrapper{display:flex;align-items:center;justify-content:space-between}.site-title{font-size:18px;font-weight:700;color:#1a1a1a;text-decoration:none;letter-spacing:-0.5px}.site-nav{display:flex;gap:20px;list-style:none}.site-nav a{font-size:13px;color:#666;text-decoration:none;transition:color .2s}.site-nav a:hover{color:#1a1a1a}.article{background:#fff;margin:24px 0;border-radius:0;box-shadow:0 1px 3px rgba(0,0,0,0.06);padding:40px 0}.article-header{margin-bottom:32px}.article-tags{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}.article-tag{font-size:11px;font-weight:600;color:#1a73e8;background:#e8f0fe;padding:4px 10px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px}.article-title{font-size:28px;font-weight:800;line-height:1.3;margin-bottom:16px;color:#1a1a1a;letter-spacing:-0.3px}.article-meta{display:flex;align-items:center;gap:12px;font-size:13px;color:#888}.article-meta .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600;flex-shrink:0}.article-meta .info{display:flex;flex-direction:column}.article-meta .author-name{font-weight:600;color:#333;font-size:13px}.article-meta .meta-detail{font-size:12px;color:#999}.article-divider{height:1px;background:#eee;margin:0 0 28px 0}.article-body{font-size:15px;color:#333;line-height:1.8}.article-body p{margin-bottom:1.2em}.article-body blockquote{border-left:3px solid #1a73e8;padding:8px 16px;margin:1.2em 0;background:#f8f9fa;border-radius:0 4px 4px 0;color:#555}.cta-card{background:linear-gradient(135deg,#f0f4ff,#e8f0fe);border-radius:12px;padding:32px;text-align:center;margin:32px 0;border:1px solid #d2e3fc}.cta-card h3{font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:8px}.cta-card p{font-size:13px;color:#666;margin-bottom:20px;line-height:1.5}.cta-btn{display:inline-flex;align-items:center;gap:8px;background:#1a73e8;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;transition:all .2s ease;box-shadow:0 4px 12px rgba(26,115,232,0.25);border:none;cursor:pointer}.cta-btn:hover{background:#1557b0;transform:translateY(-1px);box-shadow:0 6px 16px rgba(26,115,232,0.3)}.cta-btn:active{transform:translateY(0)}.article-footer{margin-top:40px;padding-top:24px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}.article-footer .share-label{font-size:12px;color:#999}.article-footer .share-links{display:flex;gap:8px}.article-footer .share-link{width:32px;height:32px;border-radius:50%;border:1px solid #e0e0e0;display:flex;align-items:center;justify-content:center;color:#666;text-decoration:none;transition:all .2s;font-size:14px}.article-footer .share-link:hover{border-color:#1a73e8;color:#1a73e8;background:#f0f4ff}.site-footer{text-align:center;padding:32px 0;font-size:12px;color:#aaa;border-top:1px solid #e8e8e8;margin-top:24px}.loading-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.95);display:none;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:16px}.loading-overlay.active{display:flex}.loading-spinner{width:40px;height:40px;border:3px solid #e8e8e8;border-top-color:#1a73e8;border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.loading-text{font-size:14px;color:#666}@media(max-width:600px){.article{padding:24px 0}.article-title{font-size:22px}.article-body{font-size:14px}.cta-card{padding:24px 16px}.wrapper{padding:0 16px}.site-header .wrapper{padding:0 16px}}</style></head><body><header class="site-header"><div class="wrapper"><a href="/" class="site-title">碎记</a><ul class="site-nav"><li><a href="/">首页</a></li><li><a href="/archive">归档</a></li><li><a href="/about">关于</a></li></ul></div></header><div class="wrapper"><article class="article"><div class="article-header"><div class="article-tags"><span class="article-tag">摄影</span><span class="article-tag">生活</span></div><h1 class="article-title">光影之间 - 一张照片的故事</h1><div class="article-meta"><div class="avatar">碎</div><div class="info"><span class="author-name">碎记</span><span class="meta-detail">发布于 ' + new Date().toISOString().slice(0,10) + ' - 摄影日志</span></div></div></div><div class="article-divider"></div><div class="article-body"><p>有时候，最动人的瞬间往往藏在最不经意的角落。</p><p>摄影的魅力或许就在于此——它不需要华丽的词艺，图像本身就能讲述一切。</p><blockquote>"Photography is the art of frozen time—the ability to store emotion and story within a single frame."</blockquote><p>由于图片经过压缩，请点击下方按钮查看原图。</p><div class="cta-card"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#1a73e8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><h3>查看完整图片</h3><p>点击下方按钮，查看无损原图</p><button class="cta-btn" id="viewBtn" data-enc="' + encryptedPath + '" data-key="' + xorKey + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>查看图片</button></div><p>感谢你的阅读，我们下期再见。</p></div><div class="article-footer"><span class="share-label">分享到：</span><div class="share-links"><a href="#" class="share-link" onclick="return false">X</a><a href="#" class="share-link" onclick="return false">F</a><a href="#" class="share-link" onclick="return false">W</a></div></div></article></div><footer class="site-footer"><p>&copy; ' + new Date().getFullYear() + ' 碎记. All rights reserved.</p></footer><div class="loading-overlay" id="loadingOverlay"><div class="loading-spinner"></div><div class="loading-text">正在加载图片...</div></div><script>(function(){function d(e,k){var r="";var b=atob(e);for(var i=0;i<b.length;i++){r+=String.fromCharCode(b.charCodeAt(i)^k.charCodeAt(i%k.length))}return decodeURIComponent(escape(atob(r)))}var btn=document.getElementById("viewBtn");if(btn){btn.addEventListener("click",function(e){e.preventDefault();var enc=btn.getAttribute("data-enc");var key=btn.getAttribute("data-key");var path=d(enc,key);var ol=document.getElementById("loadingOverlay");if(ol)ol.classList.add("active");setTimeout(function(){window.location.href=path},400)})}})();</script></body></html>';
}

function viewHtml(imageUrl, rawUrl, ua) {
  if (isCrawlerUA(ua)) return renderGarbagePage();
  const src = escapeHtml(imageUrl), href = escapeHtml(rawUrl);
  const encryptedPath = encryptPath(imageUrl, 'Ih');
  const encryptedRaw = encryptPath(rawUrl, 'Ih');
  const xorKey = 'Ih';
  return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,noarchive"><title>图片查看</title><style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}html,body{height:100%}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Lantinghei SC","Microsoft YaHei","Hiragino Sans GB","Noto Sans CJK SC",sans-serif;background:#0a0a0a;color:#e0e0e0}.top-bar{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,10,0.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.06);padding:12px 20px;display:flex;align-items:center;justify-content:space-between}.top-bar .back-link{display:flex;align-items:center;gap:8px;color:#aaa;font-size:13px;text-decoration:none}.top-bar .back-link:hover{color:#fff}.top-bar .back-link svg{width:16px;height:16px}.top-bar .page-title{font-size:13px;color:#666}.image-stage{display:flex;align-items:center;justify-content:center;width:100%;min-height:100vh;padding:80px 24px 60px}.image-stage img{max-width:100%;max-height:calc(100vh - 140px);object-fit:contain;border-radius:4px;box-shadow:0 8px 40px rgba(0,0,0,0.6);opacity:0;transition:opacity .6s ease}.image-stage img.loaded{opacity:1}.bottom-bar{position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(10,10,10,0.85);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.06);padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}.bottom-bar a{color:#7dd3fc;font-size:12px;text-decoration:none;opacity:.8}.bottom-bar a:hover{opacity:1;text-decoration:underline}.bottom-bar .sep{color:#333;font-size:12px}.bottom-bar .site-name{font-size:11px;color:#555}.loading-indicator{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:50}.loading-spinner{width:36px;height:36px;border:2px solid rgba(255,255,255,0.1);border-top-color:#7dd3fc;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}@keyframes spin{to{transform:rotate(360deg)}}.loading-indicator p{font-size:12px;color:#555}.error-state{display:none;text-align:center;padding:60px 20px}.error-state p{font-size:14px;color:#666}.error-state .retry-btn{display:inline-block;margin-top:12px;padding:8px 20px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer}@media(max-width:600px){.image-stage{padding:70px 12px 50px}.top-bar .page-title{display:none}}</style></head><body><div class="top-bar"><a href="javascript:history.back()" class="back-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>返回</a><span class="page-title">图片查看 - 碎记</span><span style="width:50px"></span></div><div class="loading-indicator" id="loadingIndicator"><div class="loading-spinner"></div><p>正在加载图片...</p></div><div class="error-state" id="errorState"><p>图片加载失败</p><button class="retry-btn" onclick="location.reload()">重新加载</button></div><div class="image-stage" id="imageStage"><img id="mainImage" src="" alt="photo" style="display:none"></div><div class="bottom-bar"><a href="#" id="rawLink" target="_blank" rel="noopener nofollow"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>下载原图</a><span class="sep">·</span><span class="site-name">由 碎记 提供</span></div><script>(function(){function d(e,k){var r="";var b=atob(e);for(var i=0;i<b.length;i++){r+=String.fromCharCode(b.charCodeAt(i)^k.charCodeAt(i%k.length))}return decodeURIComponent(escape(atob(r)))}var encImg="' + encryptedPath + '";var encRaw="' + encryptedRaw + '";var key="' + xorKey + '";var imgPath=d(encImg,key);var rawPath=d(encRaw,key);var img=document.getElementById("mainImage");var li=document.getElementById("loadingIndicator");var es=document.getElementById("errorState");var rl=document.getElementById("rawLink");if(rl)rl.href=rawPath;if(img){img.onload=function(){img.style.display="block";img.classList.add("loaded");if(li)li.style.display="none";if(es)es.style.display="none"};img.onerror=function(){if(li)li.style.display="none";if(es)es.style.display="block";img.style.display="none"};img.src=imgPath}})();</script></body></html>';
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const ua = req.headers.get('User-Agent') || '';

    if (path === '/' || path === '/index.html') {
      return new Response(blogHtml(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const imgMatch = path.match(/^\/v\/(.+?)\/img$/);
    if (imgMatch) {
      const { id, ext } = parseId(imgMatch[1]);
      const imageUrl = `https://i.urusai.cc/${encodeURIComponent(id)}.${encodeURIComponent(ext)}`;
      return new Response(viewHtml(imageUrl, imageUrl, ua), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Robots-Tag': 'noindex, noarchive',
        },
      });
    }

    const btnMatch = path.match(/^\/v\/([^/]+)$/);
    if (btnMatch) {
      const viewPath = path + '/img';
      return new Response(buttonHtml(viewPath, ua), {
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