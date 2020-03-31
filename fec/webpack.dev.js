const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  optimization: {
    chunkIds: 'size',
    removeAvailableModules: true
  },
  devServer: {
    allowedHosts: ['127.0.0.1', 'localhost', '*.fec.gov', '*.app.cloud.gov'],
    contentBase: './dist'
  }
});
