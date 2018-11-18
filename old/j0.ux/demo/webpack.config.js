const path = require('path');

module.exports = {
  context: __dirname,
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'index.bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      }
    ]
  },
  resolve: {
    root: [
      path.resolve(__dirname + '/..')
    ]
  }
};
