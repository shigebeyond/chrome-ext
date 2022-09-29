/home/shi/code/chrome/chrome-ext/test/config/webpack.config.js

const CopyWebpackPlugin = require('copy-webpack-plugin')

plugins: [
      // 复制 manifest.json
      new CopyWebpackPlugin([
        { from: 'page/manifest.json', to: 'manifest.json' },
        { from: 'img/icon.png', to: 'img/icon.png' },
      ]),


    entry: {
      'index': paths.appIndexJs,
    },