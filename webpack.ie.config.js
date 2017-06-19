var webpack = require('webpack')
var barometer = require('./package.json')
var path = require('path')

module.exports = {
  entry: [
    './lib/barometer.js'
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'barometer.ie.min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ mangle: { props: { regex: /^_/ } } }),
    new webpack.BannerPlugin(barometer.name + ' v' + barometer.version)
  ]
}
