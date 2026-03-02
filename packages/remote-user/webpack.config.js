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
    new ModuleFederationPlugin({
      name: 'remoteUser',
      filename: 'remoteEntry.js',
      exposes: {
        './UserManagement': './src/components/UserManagement.vue',
      },
      shared: {
        vue: { singleton: true, requiredVersion: '^3.4.0' },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html', title: '用户管理（独立模式）' }),
  ],
  devServer: {
    port: 3002,
    hot: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});
