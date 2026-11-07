const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'links-db.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { links: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { links: [] };
  }
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/links', (req, res) => {
  const db = getDb();
  res.json(db.links);
});

app.post('/api/links', (req, res) => {
  const { title, targetUrl, customSlug, metaPixel, tiktokPixel, gtmId } = req.body;
  if (!targetUrl) return res.status(400).json({ error: 'Target URL is required' });

  const db = getDb();
  const slug = (customSlug && customSlug.trim() !== '') 
    ? customSlug.trim().replace(/[^a-zA-Z0-9-_]/g, '') 
    : crypto.randomBytes(3).toString('hex');

  if (db.links.some(l => l.slug === slug)) {
    return res.status(400).json({ error: 'Slug is already in use. Choose another one.' });
  }

  const newLink = {
    id: crypto.randomUUID(),
    title: title || 'Untitled Campaign',
    targetUrl,
    slug,
    metaPixel: metaPixel ? metaPixel.trim() : '',
    tiktokPixel: tiktokPixel ? tiktokPixel.trim() : '',
    gtmId: gtmId ? gtmId.trim() : '',
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  db.links.unshift(newLink);
  saveDb(db);
  res.json(newLink);
});

app.delete('/api/links/:id', (req, res) => {
  const db = getDb();
  db.links = db.links.filter(l => l.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.get('/l/:slug', (req, res) => {
  const db = getDb();
  const link = db.links.find(l => l.slug === req.params.slug);

  if (!link) {
    return res.status(404).send('Link not found');
  }

  link.clicks += 1;
  saveDb(db);

  if (!link.metaPixel && !link.tiktokPixel && !link.gtmId) {
    return res.redirect(link.targetUrl);
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="1;url=${link.targetUrl}">
  ${link.metaPixel ? `
  <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${link.metaPixel}');
    fbq('track', 'PageView');
  </script>` : ''}
  ${link.tiktokPixel ? `
  <script>
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${link.tiktokPixel}');
      ttq.page();
    }(window, document, 'ttq');
  </script>` : ''}
  ${link.gtmId ? `
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${link.gtmId}');</script>` : ''}
  <style>
    body { background: #09090b; color: #fafafa; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .loader { width: 22px; height: 22px; border: 2px solid #27272a; border-top-color: #fafafa; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader"></div>
  <script>
    setTimeout(function() { window.location.replace("${link.targetUrl}"); }, 350);
  </script>
</body>
</html>`);
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PixelLink Studio — Retargeting & QR Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #09090b; color: #fafafa; }
    .glass { background: rgba(24, 24, 27, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    input:focus { outline: none; border-color: #fafafa; }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-white selection:text-black">
  <header class="border-b border-zinc-800/80 sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">PL</div>
        <div>
          <span class="font-semibold tracking-tight text-white">PixelLink</span>
          <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">STUDIO v1.0</span>
        </div>
      </div>
      <div class="text-xs text-zinc-400">Self-Hosted Retargeting Hub</div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <div class="glass rounded-xl p-6">
        <p class="text-xs uppercase tracking-wider text-zinc-400">Active Smart Links</p>
        <p id="stat-links" class="text-3xl font-semibold mt-2 text-white">0</p>
      </div>
      <div class="glass rounded-xl p-6">
        <p class="text-xs uppercase tracking-wider text-zinc-400">Total Tracked Clicks</p>
        <p id="stat-clicks" class="text-3xl font-semibold mt-2 text-white">0</p>
      </div>
      <div class="glass rounded-xl p-6">
        <p class="text-xs uppercase tracking-wider text-zinc-400">Pixel-Enabled Campaigns</p>
        <p id="stat-pixels" class="text-3xl font-semibold mt-2 text-white">0</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-5">
        <div class="glass rounded-2xl p-6 sticky top-24">
          <h2 class="text-lg font-medium text-white mb-1">Create Smart Link</h2>
          <p class="text-xs text-zinc-400 mb-6">Shorten URLs, embed ad pixels, and generate instant QR codes.</p>

          <form id="create-form" class="space-y-4">
            <div>
              <label class="block text-xs text-zinc-400 mb-1.5">Campaign Title</label>
              <input type="text" id="title" placeholder="Summer Collection Ad" class="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition">
            </div>
            <div>
              <label class="block text-xs text-zinc-400 mb-1.5">Destination URL *</label>
              <input type="url" id="targetUrl" required placeholder="https://yourstore.com/product" class="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 transition">
            </div>
            <div>
              <label class="block text-xs text-zinc-400 mb-1.5">Custom Alias (Optional)</label>
              <div class="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg overflow-hidden">
                <span class="px-3 text-xs text-zinc-500 border-r border-zinc-800 select-none">/l/</span>
                <input type="text" id="customSlug" placeholder="vip-offer" class="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none">
              </div>
            </div>
            <div class="pt-2 border-t border-zinc-800/80">
              <p class="text-xs font-medium text-zinc-300 mb-3">Retargeting Pixels (Optional)</p>
              <div class="space-y-3">
                <input type="text" id="metaPixel" placeholder="Meta Pixel ID (e.g. 1234567890)" class="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600">
                <input type="text" id="tiktokPixel" placeholder="TikTok Pixel ID (e.g. C8ABCDEF123)" class="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600">
                <input type="text" id="gtmId" placeholder="Google Tag Manager ID (e.g. GTM-XXXX)" class="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-600">
              </div>
            </div>
            <button type="submit" class="w-full bg-white hover:bg-zinc-200 text-black font-medium text-sm py-2.5 rounded-lg transition mt-2">
              Generate Smart Link & QR
            </button>
          </form>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-white">Active Campaigns</h2>
          <span class="text-xs text-zinc-500">Real-time tracking enabled</span>
        </div>
        <div id="links-container" class="space-y-3"></div>
      </div>
    </div>
  </main>

  <div id="qr-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center">
      <h3 id="qr-title" class="text-base font-semibold text-white mb-1">Campaign QR Code</h3>
      <p id="qr-url" class="text-xs text-zinc-400 mb-5 truncate"></p>
      <div id="qrcode-box" class="bg-white p-4 rounded-xl inline-block mx-auto mb-5"></div>
      <div class="flex gap-2">
        <button onclick="downloadQR()" class="flex-1 bg-white text-black text-xs font-medium py-2.5 rounded-lg hover:bg-zinc-200 transition">Download PNG</button>
        <button onclick="closeQR()" class="px-4 bg-zinc-800 text-zinc-300 text-xs font-medium py-2.5 rounded-lg hover:bg-zinc-700 transition">Close</button>
      </div>
    </div>
  </div>

  <script>
    async function loadLinks() {
      const res = await fetch('/api/links');
      const links = await res.json();
      const container = document.getElementById('links-container');
      
      document.getElementById('stat-links').innerText = links.length;
      document.getElementById('stat-clicks').innerText = links.reduce((sum, l) => sum + l.clicks, 0);
      document.getElementById('stat-pixels').innerText = links.filter(l => l.metaPixel || l.tiktokPixel || l.gtmId).length;

      if (links.length === 0) {
        container.innerHTML = '<div class="glass rounded-xl p-12 text-center text-zinc-500 text-sm">No smart links created yet. Create your first campaign on the left.</div>';
        return;
      }

      container.innerHTML = links.map(function(link) {
        var shortUrl = window.location.origin + '/l/' + link.slug;
        var badges = '';
        if (link.metaPixel) badges += '<span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Meta</span>';
        if (link.tiktokPixel) badges += '<span class="text-[10px] px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">TikTok</span>';
        if (link.gtmId) badges += '<span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">GTM</span>';
        var safeTitle = (link.title || '').replace(/'/g, '');

        return '<div class="glass rounded-xl p-5 hover:border-zinc-700 transition">' +
          '<div class="flex items-start justify-between gap-4">' +
            '<div class="min-w-0">' +
              '<div class="flex items-center gap-2 mb-1">' +
                '<h3 class="font-medium text-white text-sm truncate">' + link.title + '</h3>' + badges +
              '</div>' +
              '<a href="' + shortUrl + '" target="_blank" class="text-xs font-mono text-zinc-300 hover:underline block mb-1">' + shortUrl + '</a>' +
              '<p class="text-xs text-zinc-500 truncate">' + link.targetUrl + '</p>' +
            '</div>' +
            '<div class="text-right shrink-0">' +
              '<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">' +
                '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>' +
                '<span class="text-xs font-semibold text-white">' + link.clicks + '</span>' +
                '<span class="text-[11px] text-zinc-400">clicks</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/60">' +
            '<button onclick="copyUrl(\\'' + shortUrl + '\\')" class="text-xs px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition">Copy Link</button>' +
            '<button onclick="openQR(\\'' + safeTitle + '\\', \\'' + shortUrl + '\\')" class="text-xs px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition">QR Code</button>' +
            '<button onclick="deleteLink(\\'' + link.id + '\\')" class="text-xs px-3 py-1.5 rounded-md text-red-400 hover:bg-red-500/10 ml-auto transition">Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    document.getElementById('create-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('title').value,
        targetUrl: document.getElementById('targetUrl').value,
        customSlug: document.getElementById('customSlug').value,
        metaPixel: document.getElementById('metaPixel').value,
        tiktokPixel: document.getElementById('tiktokPixel').value,
        gtmId: document.getElementById('gtmId').value
      };

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Error creating link');
      e.target.reset();
      loadLinks();
    });

    async function deleteLink(id) {
      await fetch('/api/links/' + id, { method: 'DELETE' });
      loadLinks();
    }

    function copyUrl(url) {
      navigator.clipboard.writeText(url);
      alert('Copied: ' + url);
    }

    function openQR(title, url) {
      document.getElementById('qr-title').innerText = title;
      document.getElementById('qr-url').innerText = url;
      const box = document.getElementById('qrcode-box');
      box.innerHTML = '';
      new QRCode(box, { text: url, width: 180, height: 180, colorDark: "#000000", colorLight: "#ffffff" });
      const modal = document.getElementById('qr-modal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeQR() {
      const modal = document.getElementById('qr-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function downloadQR() {
      const img = document.querySelector('#qrcode-box img');
      if (!img) return;
      const a = document.createElement('a');
      a.href = img.src;
      a.download = 'pixellink-qr.png';
      a.click();
    }

    loadLinks();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log('PixelLink Studio running on port ' + PORT);
});
