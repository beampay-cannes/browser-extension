const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    popup: './src/extension/popup.ts',
    background: './src/extension/background.ts',
    content: './src/extension/content.ts',
    inject: './src/extension/inject.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.extension.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new Dotenv({
      path: '.env',
      safe: true,
      systemvars: true,
      silent: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/extension/manifest.json',
          to: 'manifest.json',
        },
        {
          from: 'src/extension/popup.html',
          to: 'popup.html',
        },
      ],
    }),
  ],
  optimization: {
    minimize: false, // Easier debugging for extension
  },
}; 