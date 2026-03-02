const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

// 远程模块 URL：本地开发用 localhost，Vercel 部署后替换为实际域名
const REMOTE_MONITOR_URL = process.env.REMOTE_MONITOR_URL || 'http://localhost:3001';
const REMOTE_USER_URL = process.env.REMOTE_USER_URL || 'http://localhost:3002';

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
    // 允许跨域访问（Shell 加载远程 remoteEntry.js 时需要）
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  optimization: {
    runtimeChunk: false,
  },
});
