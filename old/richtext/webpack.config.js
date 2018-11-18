var path = require('path');

module.exports = {
  devtool: "source-map",
  entry: {
    demo: './RichTextDemo.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname,
  }
};
