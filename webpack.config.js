var webpack = require('webpack')
var JSCrush = require('webpack-jscrush')
var barometer = require('./package.json')

module.exports = {
  entry: [
    './lib/barometer.js'
  ],
  output: {
    path: './dist',
    filename: 'barometer.min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ mangle: { props: { regex: /^_/ } } }),
    new JSCrush(),
    new webpack.BannerPlugin(barometer.name + ' v' + barometer.version)
  ]
}
