'use strict'

module.exports = function (config) {
  config.set({
    frameworks: [ 'mocha' ],
    files: [
      'dist/barometer.min.js',
      'dist/barometer-test.js'
    ],
    reporters: [ 'spec' ],
    plugins: [ 'karma-mocha', 'karma-firefox-launcher', 'karma-spec-reporter' ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: [ 'Firefox' ],
    singleRun: true,
    concurrency: 1,
    client: {
      captureConsole: true,
      timeout: 10000,
      mocha: {
        timeout: 10000
      }
    }
  })
}
