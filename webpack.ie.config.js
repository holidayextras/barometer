var webpack = require('webpack')
var barometer = require('./package.json')

module.exports = {
  entry: [
    './lib/barometer.js'
  ],
  output: {
    path: './dist',
    filename: 'barometer.ie.min.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ mangle: { props: { regex: /^_/ } } }),
    new webpack.BannerPlugin(barometer.name + ' v' + barometer.version)
  ]
}
