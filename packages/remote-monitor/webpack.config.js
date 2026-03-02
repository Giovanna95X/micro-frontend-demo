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
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});
