/**
 * 简化版 CAS SSO 服务器
 *
 * 实现 CAS 协议核心流程：
 *   TGC（Ticket Granting Cookie）—— 存在 SSO 域，代表"已在 SSO 登录"
 *   ST（Service Ticket）       —— 一次性票据，携带在 URL 中，10 秒过期
 *   Session                    —— 业务应用持有的 SESSIONID，存储在内存中（生产用 Redis）
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ── 内存存储（生产环境替换为 Redis） ──────────────────────────────────────
const TGC_STORE = new Map();     // tgcToken  → { username, role }
const ST_STORE = new Map();      // ticket    → { username, role, service, createdAt }
const SESSION_STORE = new Map(); // sessionId → { username, role, createdAt }

// 预设账号（使用非常见密码，避免 Chrome 密码泄漏检测误报）
const USERS = {
  admin: { password: 'mfAdmin@demo', role: '管理员' },
  user:  { password: 'mfUser@demo',  role: '开发者' },
};

// 定时清理过期 ST（10 秒）
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ST_STORE) {
    if (now - v.createdAt > 10_000) ST_STORE.delete(k);
  }
}, 5000);

// ── 工具函数 ──────────────────────────────────────────────────────────────
function genToken(prefix) {
  return `${prefix}-${crypto.randomBytes(20).toString('hex')}`;
}

function loginPage(service, error = '') {
  return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSO 统一登录</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f1117;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #e2e8f0;
    }
    .card {
      width: 380px;
      background: #1a1d27;
      border: 1px solid #2d3142;
      border-radius: 12px;
      padding: 36px 32px;
    }
    .sso-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #64748b;
      background: #0f1117;
      border: 1px solid #2d3142;
      border-radius: 20px;
      padding: 3px 10px;
      margin-bottom: 20px;
    }
    .sso-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 6px;
    }
    .sub {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 28px;
    }
    label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 10px 12px;
      background: #0f1117;
      border: 1px solid #2d3142;
      border-radius: 7px;
      color: #e2e8f0;
      font-size: 14px;
      outline: none;
      margin-bottom: 16px;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #3b82f6; }
    button {
      width: 100%;
      padding: 11px;
      background: #3b82f6;
      color: #fff;
      border: none;
      border-radius: 7px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #2563eb; }
    .error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 7px;
      padding: 10px 12px;
      font-size: 13px;
      color: #f87171;
      margin-bottom: 16px;
    }
    .hint {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #2d3142;
      font-size: 11px;
      color: #475569;
    }
    .hint code {
      background: #0f1117;
      padding: 1px 5px;
      border-radius: 3px;
      color: #64748b;
    }
    .service-url {
      margin-top: 16px;
      padding: 8px 12px;
      background: #0f1117;
      border: 1px solid #2d3142;
      border-radius: 6px;
      font-size: 11px;
      color: #475569;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="sso-badge"><span class="sso-dot"></span>SSO Server · localhost:4000</div>
    <h1>统一身份认证</h1>
    <p class="sub">CAS 协议 · TGC + Service Ticket</p>

    ${error ? `<div class="error">${error}</div>` : ''}

    <form method="POST" action="/login">
      <input type="hidden" name="service" value="${service}">
      <label>用户名</label>
      <input type="text" name="username" placeholder="admin" autocomplete="off" required>
      <label>密码</label>
      <input type="password" name="password" placeholder="mfAdmin@demo" autocomplete="off" required>
      <button type="submit">登录</button>
    </form>

    <div class="hint">
      测试账号：<code>admin / mfAdmin@demo</code> 或 <code>user / mfUser@demo</code>
    </div>
    <div class="service-url">回调地址：${service}</div>
  </div>
</body>
</html>`;
}

// ── 路由 ─────────────────────────────────────────────────────────────────

// GET /login?service=<returnUrl>
// 有效 TGC → 免密直接签发 ST（SSO 单点免登录效果）
// 无 TGC  → 返回登录页
app.get('/login', (req, res) => {
  const service = req.query.service || 'http://localhost:3000';
  const tgc = req.cookies.TGC;

  if (tgc && TGC_STORE.has(tgc)) {
    const { username, role } = TGC_STORE.get(tgc);
    const ticket = genToken('ST');
    ST_STORE.set(ticket, { username, role, service, createdAt: Date.now() });
    return res.redirect(`${service}?ticket=${ticket}`);
  }

  res.send(loginPage(service));
});

// POST /login — 验证账密，颁发 TGC + ST
app.post('/login', (req, res) => {
  const { username, password, service } = req.body;
  const user = USERS[username];

  if (!user || user.password !== password) {
    return res.send(loginPage(service || 'http://localhost:3000', '用户名或密码错误'));
  }

  // 颁发 TGC（保存在 SSO 域 Cookie，代表"已在 SSO 登录"）
  const tgc = genToken('TGC');
  TGC_STORE.set(tgc, { username, role: user.role });
  res.cookie('TGC', tgc, {
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 小时
    sameSite: 'lax',
  });

  // 颁发一次性 ST
  const ticket = genToken('ST');
  ST_STORE.set(ticket, { username, role: user.role, service, createdAt: Date.now() });

  res.redirect(`${service}?ticket=${ticket}`);
});

// GET /logout?service=<url> — 完整 CAS 登出：删除 TGC，跳回登录页（此时无 TGC，显示表单）
app.get('/logout', (req, res) => {
  const service = req.query.service || 'http://localhost:3000';
  const tgc = req.cookies.TGC;
  if (tgc) TGC_STORE.delete(tgc);
  res.clearCookie('TGC', { httpOnly: true, sameSite: 'lax', path: '/' });
  res.redirect(`/login?service=${encodeURIComponent(service)}`);
});

// GET /api/validate?ticket=<ST>&service=<url>
// 服务端 back-channel 验证 ST，返回用户信息（ST 立即失效）
app.get('/api/validate', (req, res) => {
  const { ticket, service } = req.query;
  const st = ST_STORE.get(ticket);

  if (!st) {
    return res.status(401).json({ error: 'Invalid or expired ticket' });
  }
  if (st.service !== service) {
    return res.status(401).json({ error: 'Service mismatch' });
  }
  if (Date.now() - st.createdAt > 10_000) {
    ST_STORE.delete(ticket);
    return res.status(401).json({ error: 'Ticket expired' });
  }

  // ST 一次性消费，立即删除
  ST_STORE.delete(ticket);

  res.json({ username: st.username, role: st.role });
});

// POST /api/session — 业务服务器创建 session（ST 验证通过后调用）
app.post('/api/session', (req, res) => {
  const { username, role } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  const sessionId = genToken('SID');
  SESSION_STORE.set(sessionId, { username, role, createdAt: Date.now() });
  res.json({ sessionId });
});

// GET /api/session/:id — 子应用服务器验证 SESSIONID
app.get('/api/session/:id', (req, res) => {
  const session = SESSION_STORE.get(req.params.id);
  if (!session) return res.status(401).json({ error: 'Invalid session' });
  res.json({ username: session.username, role: session.role });
});

// DELETE /api/session/:id — 登出，删除 session
app.delete('/api/session/:id', (req, res) => {
  SESSION_STORE.delete(req.params.id);
  res.json({ ok: true });
});

app.listen(4000, () => {
  console.log('[SSO Server] running at http://localhost:4000');
  console.log('[SSO Server] accounts: admin/admin123, user/user123');
});
