const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
  entry: './src/main.ts',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
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
          options: { appendTsSuffixTo: [/\.vue$/], transpileOnly: true },
        },
        exclude: /node_modules/,
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    /**
     * Remote 配置：
     *   name: 'remoteMonitor' —— 必须与 Shell 中 remotes 配置的变量名一致
     *   filename: 'remoteEntry.js' —— Shell 通过此文件加载该模块
     *   exposes: 暴露给 Shell 的组件，Shell 通过 import('remoteMonitor/MonitorDashboard') 使用
     */
    new ModuleFederationPlugin({
      name: 'remoteMonitor',
      filename: 'remoteEntry.js',
      exposes: {
        './MonitorDashboard': './src/components/MonitorDashboard.vue',
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.4.0' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html', title: '监控面板（独立模式）' }),
  ],
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    // credentials: include 要求明确 origin，不能使用通配符 *
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
    },
    // GET /__auth — 子应用服务端用 SESSIONID 向 SSO 验证，演示父域 Cookie 共享效果
    setupMiddlewares(middlewares, devServer) {
      const cookieParser = require('cookie-parser');
      devServer.app.use(cookieParser());

      devServer.app.get('/__auth', async (req, res) => {
        // 必须在路由层手动设置 CORS 头：devServer.headers 配置由内部中间件注入，
        // 晚于 devServer.app.get() 注册的路由执行，导致自定义路由的响应缺少这两个头，
        // 浏览器因 credentials:include + 无 Allow-Credentials 而直接 reject fetch。
        res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.set('Access-Control-Allow-Credentials', 'true');

        const sid = req.cookies.SESSIONID;
        if (!sid) return res.status(401).json({ valid: false, error: 'no session' });
        try {
          const ssoRes = await fetch(`http://localhost:4000/api/session/${sid}`);
          if (!ssoRes.ok) return res.status(401).json({ valid: false, error: 'invalid session' });
          const data = await ssoRes.json();
          res.json({ valid: true, username: data.username, role: data.role });
        } catch {
          res.status(503).json({ valid: false, error: 'sso unreachable' });
        }
      });

      return middlewares;
    },
  },
});
