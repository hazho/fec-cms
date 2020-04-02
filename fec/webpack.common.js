/**
 * Documentation for Webpack 4.42.1: https://v4.webpack.js.org/concepts/
 */

/* global __dirname */

const path = require('path');
// const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Start with normal entry points
let entries = {
  init: './fec/static/js/init.js',
  polyfills: './fec/static/js/polyfills.js',
  vendor: ['jquery', 'handlebars'],
  'data-init': './fec/static/js/data-init.js'
};

// Then the widget entry points
const widgetEntries = {
  'data-map': './fec/static/js/modules/data-map.js',
  'aggregate-totals': './fec/static/js/widgets/aggregate-totals.js',
  'aggregate-totals-box': './fec/static/js/widgets/aggregate-totals-box.js',
  'contributions-by-state': './fec/static/js/widgets/contributions-by-state.js',
  'contributions-by-state-box':
    './fec/static/js/widgets/contributions-by-state-box.js',
  'pres-finance-map-box': './fec/static/js/widgets/pres-finance-map-box.js'
};

// Don't add the hash to the filename for these entry points
const entriesNotToHash = [
  'aggregate-totals-box',
  'contributions-by-state-box',
  'pres-finance-map-box'
];





// Combine the various entry points
entries = Object.assign({}, entries, widgetEntries);

// const datatableEntries = [];

// fs.readdirSync('./fec/static/js/pages').forEach(function(f) {
//   if (f.search('.js') < 0) {
//     return;
//   } // Skip non-js files
//   let name = f.split('.js')[0];
//   let p = path.join('./fec/static/js/pages', f);
//   entries[name] = './' + p;

//   // Note all datatable pages for getting the common chunk
//   if (name.search('datatable-') > -1) {
//     datatableEntries.push(name);
//   }
// });



module.exports = {
  entry: entries,
  output: {
    path: path.resolve(__dirname, './dist/fec/static/js'),
    filename: chunkData => {
      let toHash = true;
      let isWidget = false;

      if (entriesNotToHash[chunkData.chunk.name]) toHash = false;
      if (widgetEntries[chunkData.chunk.name]) isWidget = true;

      let toReturn = '';
      if (isWidget) toReturn += 'widgets/';
      toReturn += toHash ? '[name]-[hash].js' : '[name].js';

      return toReturn;
    },
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
        use: ['handlebars-template-loader', 'cache-loader']
      },
      {
        test: /\.(js(x)?)(\?.*)?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              retainLines: true
            }
          }
        ],
        include: [path.join(__dirname, 'src')]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              emitFile: true,
              name: '[name].[ext]',
              publicPath: '/docs/static/dist'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 50000
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: false
        }
      })
    ],
    splitChunks: {
      // chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        // typeahead: {
        //   test: './fec/static/js/modules/typeahead.js',
        //   priority: 0
        // },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(['./dist/fec/static/js'], { verbose: true })
    //   new ExtractTextPlugin({
    //     filename: 'main.css',
    //     allChunks: true
    //   })
  ]
};
