const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

// 远程模块 URL：
//   本地开发: npm run dev 时使用 localhost
//   Vercel 生产: 自动使用已部署的 Remote URL
const REMOTE_MONITOR_URL =
  process.env.REMOTE_MONITOR_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://remote-monitor.vercel.app'
    : 'http://localhost:3001');

const REMOTE_USER_URL =
  process.env.REMOTE_USER_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://remote-user-sage.vercel.app'
    : 'http://localhost:3002');

module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
  entry: './src/main.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    // auto 模式：webpack 自动推断 publicPath，Vercel 部署无需手动修改
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true, // 加快构建速度，类型检查交给 IDE
          },
        },
        exclude: /node_modules/,
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    /**
     * 模块联邦核心配置
     *
     * Shell 作为 Host（宿主），消费两个远程模块：
     *   - remoteMonitor：服务监控面板
     *   - remoteUser：用户管理
     *
     * shared 配置：确保 Vue / Pinia / Vue Router 在所有模块间只加载一次（singleton）
     * 避免多实例导致的 "provide/inject 失效" 等问题
     */
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        remoteMonitor: `remoteMonitor@${REMOTE_MONITOR_URL}/remoteEntry.js`,
        remoteUser: `remoteUser@${REMOTE_USER_URL}/remoteEntry.js`,
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.4.0' },
        'vue-router': { singleton: true, requiredVersion: '^4.2.5' },
        pinia: { singleton: true, requiredVersion: '^2.1.7' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html', title: '微前端模块联邦 Demo' }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    /**
     * CAS SSO 中间件
     * webpack-dev-server 内部使用 Express，通过 setupMiddlewares 注入自定义路由。
     * 这里模拟业务服务器的两个职责：
     *   1. 拦截 HTML 请求 → 检查 SESSIONID → 无效则重定向至 SSO
     *   2. 处理 SSO 回调（?ticket=）→ 服务端验证 ST → 生成 SESSIONID Cookie
     */
    setupMiddlewares(middlewares, devServer) {
      const cookieParser = require('cookie-parser');
      devServer.app.use(cookieParser());

      const SSO_URL = 'http://localhost:4000';
      const SHELL_URL = 'http://localhost:3000';

      // 服务端验证 ST，back-channel 调用 SSO
      async function validateTicket(ticket) {
        try {
          const res = await fetch(
            `${SSO_URL}/api/validate?ticket=${ticket}&service=${encodeURIComponent(SHELL_URL)}`
          );
          if (!res.ok) return null;
          return await res.json(); // { username, role }
        } catch { return null; }
      }

      // 验证 SESSIONID 是否有效
      async function validateSession(sessionId) {
        try {
          const res = await fetch(`${SSO_URL}/api/session/${sessionId}`);
          if (!res.ok) return null;
          return await res.json(); // { username, role }
        } catch { return null; }
      }

      // 创建 Session（ST 验证通过后调用）
      async function createSession(username, role) {
        const res = await fetch(`${SSO_URL}/api/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, role }),
        });
        const data = await res.json();
        return data.sessionId;
      }

      // GET /__session — Vue 应用初始化时拉取当前登录用户信息
      // 同源请求（shell Vue 调 shell devServer），但仍需显式设置以防 CORS 预检拦截
      devServer.app.get('/__session', async (req, res) => {
        res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.set('Access-Control-Allow-Credentials', 'true');
        const sid = req.cookies.SESSIONID;
        if (!sid) return res.status(401).json({ error: 'no session' });
        const session = await validateSession(sid);
        if (!session) return res.status(401).json({ error: 'invalid session' });
        res.json(session);
      });

      // GET /__sso-logout — 服务端全程处理登出，避免前端 fetch + location 组合的时序问题
      // 流程：① 删除 SSO Session  ② 清除 SESSIONID Cookie  ③ 直接 302 至 SSO 登录页
      devServer.app.get('/__sso-logout', async (req, res) => {
        const sid = req.cookies.SESSIONID;
        if (sid) {
          await fetch(`${SSO_URL}/api/session/${sid}`, { method: 'DELETE' }).catch(() => {});
        }
        res.clearCookie('SESSIONID', { httpOnly: true, sameSite: 'lax', path: '/' });
        res.redirect(`${SSO_URL}/logout?service=${encodeURIComponent(SHELL_URL)}`);
      });

      // GET * — 拦截 HTML 导航请求，执行 CAS 认证检查
      devServer.app.get('*', async (req, res, next) => {
        // 只处理浏览器导航（HTML 请求），放行 JS/CSS/字体等静态资源
        const acceptsHtml = req.headers.accept?.includes('text/html');
        if (!acceptsHtml) return next();

        const ticket = req.query.ticket;
        const sid = req.cookies.SESSIONID;

        // ① 携带 ST 票据 → 服务端验证（SSO 回调）
        if (ticket) {
          const user = await validateTicket(ticket);
          if (user) {
            const sessionId = await createSession(user.username, user.role);
            // SESSIONID Cookie 不指定 domain，默认绑定 localhost（端口无关）
            // 子应用（:3001/:3002）请求时浏览器自动携带
            res.cookie('SESSIONID', sessionId, {
              httpOnly: true,
              sameSite: 'lax',
              maxAge: 8 * 60 * 60 * 1000,
            });
            // 去掉 URL 中的 ticket 参数，重定向到干净 URL
            const cleanUrl = req.path || '/';
            return res.redirect(cleanUrl);
          }
        }

        // ② 已有 SESSIONID → 验证有效性
        if (sid) {
          const session = await validateSession(sid);
          if (session) return next(); // 有效，放行
          // Session 失效，清除旧 Cookie
          res.clearCookie('SESSIONID', { path: '/' });
        }

        // ③ 未登录 → 重定向至 SSO 登录页
        res.redirect(`${SSO_URL}/login?service=${encodeURIComponent(SHELL_URL)}`);
      });

      return middlewares;
    },
  },
  optimization: {
    runtimeChunk: false,
  },
});
