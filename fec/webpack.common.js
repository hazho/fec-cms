/**
 * Documentation for Webpack 4.42.1: https://v4.webpack.js.org/concepts/
 */

/* global __dirname */

const fs = require('fs');
const path = require('path');
// const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// let externals = {
//   jquery: 'jquery',
//   'jquery.inputmask': 'jquery.inputmask',
//   'jquery.inputmask/dist/inputmask/inputmask.date.extensions':
//     'jquery.inputmask/dist/inputmask/inputmask.date.extensions'
  // https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/3.3.4/inputmask/inputmask.min.js
//   underscore: 'underscore',
//   react: 'react',
//   d3: 'd3'
// };

// Start with normal entry points
let entries = {
  // helpers: './fec/static/js/modules/helpers',
  init: './fec/static/js/init.js',
  legalApp: './fec/static/js/legal/LegalApp.js',
  polyfills: './fec/static/js/polyfills.js',
  vendor: [
    'handlebars',
    'jquery',
    'jquery.inputmask',
    'inputmask',
    'inputmask.dependencyLib',
    'jquery.inputmask/dist/inputmask/inputmask.date.extensions',
    'lodash'
  ],
  'data-init': './fec/static/js/data-init.js',
  'dataviz-common': [
    './fec/static/js/pages/data-landing.js',
    './fec/static/js/pages/candidate-single.js',
    './fec/static/js/pages/committee-single.js',
    './fec/static/js/pages/elections.js'
  ]
};

// Then the widget entry points
const widgetEntries = {
  // 'data-map': './fec/static/js/modules/data-map.js',
  'aggregate-totals': './fec/static/js/widgets/aggregate-totals.js',
  'aggregate-totals-box': './fec/static/js/widgets/aggregate-totals-box.js',
  'contributions-by-state': './fec/static/js/widgets/contributions-by-state.js',
  'contributions-by-state-box':
    './fec/static/js/widgets/contributions-by-state-box.js',
  'pres-finance-map-box': './fec/static/js/widgets/pres-finance-map-box.js'
};

// Don't add the hash to the filename for these entry points
// Checking for entriesNotToHash['aggregate-totals'] so their values only need to be truthy
const entriesNotToHash = {
  'aggregate-totals': true,
  'contributions-by-state': true,
  'pres-finance-map': true
};

const datatableCommon = [];

fs.readdirSync('./fec/static/js/pages').forEach(function(f) {
  let pagesPath = './fec/static/js/pages';
  if (f.search('.js') < 0) {
    return;
  } // Skip non-js files
  let name = f.split('.js')[0];
  let p = path.join(pagesPath, f);
  p = './' + p;
  entries[name] = p;

  // Note all datatable pages for getting the common chunk
  if (name.search('datatable-') > -1) {
    datatableCommon.push(p);
  }
});

// Combine the various entry points
entries = Object.assign({}, entries, widgetEntries, {
  'datatable-common': datatableCommon
});

module.exports = {
  entry: entries,
  // externals: externals,
  // stats: 'verbose',
  output: {
    filename: chunkData => {
      let toHash = true;
      let isWidget = false;

      if (entriesNotToHash[chunkData.chunk.name]) toHash = false;
      if (widgetEntries[chunkData.chunk.name]) isWidget = true;

      let toReturn = '';
      if (isWidget) toReturn += 'widgets/';
      toReturn += toHash ? '[name]-[contenthash].js' : '[name].js';

      return toReturn;
    },
    path: path.resolve(__dirname, './dist/fec/static/js'),
    chunkFilename: '[name].bundle.js'
  },

  // mode: 'production', // Module will be overwritten by webpack.dev.js and webpack.prod.js

  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader'
      // },
      {
        test: /\.hbs/,
        include: path.resolve(__dirname, './fec/static/js/templates'),
        // loader: 'handlebars-template-loader'
        use: ['handlebars-template-loader', 'cache-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
          // retainLines: true
        }
      }
      // {
      //   test: /\.css$/,
      //   include: path.join(__dirname, 'src'),
      //   use: [MiniCssExtractPlugin.loader, 'css-loader']
      // },
      // {
      //   test: /\.(png|jpg|gif|svg)$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         emitFile: true,
      //         name: '[name].[ext]',
      //         publicPath: '/docs/static/dist'
      //       }
      //     }
      //   ]
      // },
      // {
      //   test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      //   use: {
      //     loader: 'url-loader',
      //     options: {
      //       limit: 50000
      //     }
      //   }
      // }
    ]
  },
  optimization: {
    splitChunks: {
      // chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(['./dist/fec/static/js'], { verbose: true }),
    new ManifestPlugin({
      fileName: 'rev-manifest-js.json',
      // fileName: (var1, var2) => {
      //   console.log('manifestplugin.fileName: ', var1, var2);
      //   return 'rev-manifest-js.json';
      // },
      basePath: '/static/js/'
      // map: (var1, index, var3, var4) => {
      //   console.log('manifestplugin.map():');
      //   console.log('var1: ', var1);
      //   console.log('index: ', index);
      //   console.log('var3: ', var3);
      //   console.log('var4: ', var4);
      //     // return 'rev-manifest-js.json';
      // }
      // basePath: (var1, var2) => {
      //   console.log('manifestplugin.basePath: ', var1, var2);
      //   return '/static/js/';
      // }
    })
    //   new ExtractTextPlugin({
    //     filename: 'main.css',
    //     allChunks: true
    //   })
  ],
  resolve: {
    alias: {
      // There's a known issue with jquery.inputmask and webpack.
      // These aliases resolve the issues
      jquery: path.join(__dirname, '../node_modules/jquery/dist/jquery.js'),
      'inputmask.dependencyLib': path.join(
        __dirname,
        '../node_modules/jquery.inputmask/dist/inputmask/inputmask.dependencyLib.js'
      ),
      'jquery.inputmask/dist/inputmask/inputmask.date.extensions': path.join(
        __dirname,
        '../node_modules/jquery.inputmask/dist/inputmask/inputmask.date.extensions.js'
      ),
      inputmask: path.join(
        __dirname,
        '../node_modules/jquery.inputmask/dist/inputmask/inputmask.js'
      ),
      'jquery.inputmask': path.join(
        __dirname,
        '../node_modules/jquery.inputmask/dist/inputmask/jquery.inputmask.js'
      )
    }
  }
};
