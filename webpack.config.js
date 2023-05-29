const path = require('path');
const webpack = require('webpack');


module.exports = {
  entry: {
    main: path.resolve(__dirname, 'application/frontend/src/index.js'),
  },
  resolve: {
    modules: [
      path.resolve(__dirname + '/application/frontend/src'),
      path.resolve(__dirname + '/node_modules')
    ]
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
  ],
  output: {
    path: path.resolve(__dirname, 'application/frontend/static/frontend'),
    // filename: '[name].[contenthash].js',
    filename: '[name].js',
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      // cacheGroups: {
      //   vendor: {
      //     test: /[\\/]node_modules[\\/]/,
      //     name(module) {
      //       // get the name. E.g. node_modules/packageName/not/this/part.js
      //       // or node_modules/packageName
      //       const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

      //       // npm package names are URL-safe, but some servers don't like @ symbols
      //       return `npm.${packageName.replace('@', '')}`;
      //     },
      //   },
      // },
    },
  },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
              test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
              use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                  }
                }
              ]
            },
            {
                test: /\.less$/,
                use: [
                { loader: "style-loader" },
                { loader: "css-loader" },
                {
                    loader: "postcss-loader", // Run post css actions
                    options: {
                    plugins: function() {
                        // post css plugins, can be exported to postcss.config.js
                        return [require("precss"), require("autoprefixer")];
                    }
                    }
                },
                {
                    loader: "less-loader",
                    options: {
                    javascriptEnabled: true
                    }
                }
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                  {
                    loader: 'file-loader',
                  },
                ],
              },
            {
                test: /\.bpmn$/,
                use: 'raw-loader'
            }
        ]
    }
}