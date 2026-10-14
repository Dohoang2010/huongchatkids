/* Service worker: chạy được khi mất mạng + nhận thông báo đẩy */
const BAN = 'lich-v1';
const TEP = ['./', 'index.html', 'app.css?v=1', 'app.js?v=1', 'config.js?v=1', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'badge-96.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(BAN).then(c => c.addAll(TEP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== BAN).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Lấy bản mới từ mạng trước; mất mạng thì dùng bản đã lưu
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const ban = res.clone(); caches.open(BAN).then(c => c.put(e.request, ban)); }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./') : Response.error()))));
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    if (typeof d.badge === 'number' && self.navigator.setAppBadge) { try { await self.navigator.setAppBadge(d.badge); } catch (err) { /* bỏ qua */ } }
    await self.registration.showNotification(d.title || 'Lịch làm việc', {
      body: d.body || 'Bạn có thông báo mới', tag: d.tag || undefined, data: { url: d.url || './' },
      icon: 'icon-192.png', badge: 'badge-96.png', lang: 'vi'
    });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const ds = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of ds) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        c.postMessage({ mo: url });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
