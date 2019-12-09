const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, './src/index.js'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'gh-contrib-widget.js',
    library: 'GhContribWidget',
  }
};
