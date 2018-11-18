var path = require('path');

module.exports = {
  devtool: "source-map",
  entry: './demo.js',
  output: {
    filename: 'demo.bundle.js',
    path: __dirname,
  }
};
