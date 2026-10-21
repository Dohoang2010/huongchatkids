'use strict';
/* Đặt mã đăng bài page Facebook lên VPS (chạy bằng root, gọi từ tools/may-chu-vps/cai-facebook.ps1 qua ssh).
   Vào (stdin, JSON): { appId, appSecret, userToken, pageId? }  – hoặc { pageToken, pageId } nếu đã có sẵn mã page.
   Làm: đổi mã người dùng ngắn hạn → dài hạn → lấy mã PAGE (mã page lấy từ mã dài hạn không tự hết hạn),
        kiểm tra page đọc được, ghi FB_PAGE_ID + FB_PAGE_TOKEN vào /etc/hck-api/env (sao lưu .truoc-facebook), khởi động lại hck-api.
   Ra (stdout, JSON): { ok, trang } | { ok:false, chon:[{id,ten}] } (nhiều page – chọn rồi chạy lại) | { ok:false, msg }. Không in mã ra màn hình. */
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const VER = process.env.FB_GRAPH_VER || 'v23.0', ENV = '/etc/hck-api/env';
const ra = (o) => { process.stdout.write(JSON.stringify(o) + '\n'); process.exit(0); };
async function graph(duong, ts) {
  const u = new URL('https://graph.facebook.com/' + VER + '/' + duong); Object.entries(ts).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { signal: AbortSignal.timeout(30000) }); const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error((d.error && (d.error.error_user_msg || d.error.message)) || ('Facebook trả về ' + r.status));
  return d;
}
(async () => {
  let vao = ''; for await (const c of process.stdin) vao += c;
  let v; try { v = JSON.parse(vao); } catch { ra({ ok: false, msg: 'Dữ liệu vào không hợp lệ' }); }
  const sach = (s) => String(s || '').replace(/\s+/g, '');
  let pageId = sach(v.pageId), pageToken = sach(v.pageToken), ten = '';
  try {
    if (!pageToken) {
      if (!sach(v.appId) || !sach(v.appSecret) || !sach(v.userToken)) ra({ ok: false, msg: 'Thiếu App ID / App Secret / mã người dùng' });
      const dai = await graph('oauth/access_token', { grant_type: 'fb_exchange_token', client_id: sach(v.appId), client_secret: sach(v.appSecret), fb_exchange_token: sach(v.userToken) });
      const ds = (await graph('me/accounts', { fields: 'id,name,access_token,tasks', limit: '100', access_token: dai.access_token })).data || [];
      if (!ds.length) ra({ ok: false, msg: 'Tài khoản này không quản trị page nào (hoặc chưa cấp quyền pages_show_list)' });
      const p = pageId ? ds.find((x) => x.id === pageId) : ds.length === 1 ? ds[0] : null;
      if (!p) ra({ ok: false, chon: ds.map((x) => ({ id: x.id, ten: x.name })) });
      if (p.tasks && !p.tasks.includes('CREATE_CONTENT')) ra({ ok: false, msg: 'Tài khoản không có quyền tạo bài trên page "' + p.name + '"' });
      pageId = p.id; pageToken = p.access_token; ten = p.name;
    }
    const kt = await graph(encodeURIComponent(pageId), { fields: 'id,name', access_token: pageToken });
    ten = kt.name || ten;
  } catch (e) { ra({ ok: false, msg: e.message }); }
  let env = ''; try { env = fs.readFileSync(ENV, 'utf8'); fs.writeFileSync(ENV + '.truoc-facebook', env, { mode: 0o600 }); } catch { env = ''; }
  env = env.split('\n').filter((d) => !/^FB_PAGE_(ID|TOKEN)=/.test(d)).join('\n').replace(/\n*$/, '\n') + 'FB_PAGE_ID=' + pageId + '\nFB_PAGE_TOKEN=' + pageToken + '\n';
  fs.writeFileSync(ENV, env, { mode: 0o600 }); fs.chmodSync(ENV, 0o600);
  try { execFileSync('systemctl', ['restart', 'hck-api'], { stdio: 'ignore' }); } catch { /* báo bên dưới */ }
  ra({ ok: true, trang: ten, id: pageId });
})();
