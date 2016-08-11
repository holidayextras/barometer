'use strict'

var customLaunchers = {
  win7ie8: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows XP',
    version: '8.0'
  },
  win7ie7: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows XP',
    version: '7.0'
  }
}

module.exports = function (config) {
  config.set({
    sauceLabs: {
      testName: 'barometer full stack tests'
    },
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    frameworks: [ 'mocha', 'sinon' ],
    reporters: [ 'spec', 'saucelabs' ],
    plugins: [ 'karma-sinon-ie', 'karma-mocha', 'karma-sauce-launcher', 'karma-spec-reporter' ],
    singleRun: true,
    autoWatch: false,
    files: [
      'dist/barometer-ie.min.js',
      'dist/barometer-test.js'
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: 5,
    client: {
      captureConsole: true,
      timeout: 10000,
      mocha: {
        timeout: 10000
      }
    },
    captureTimeout: 300000,
    customHeaders: [{
      name: 'Access-Control-Allow-Origin',
      value: '*'
    },
    {
      name: 'Access-Control-Allow-Methods',
      value: 'GET, POST, PATCH, DELETE, OPTIONS'
    }],
    startConnect: true,
    connectOptions: {
      verbose: false,
      verboseDebugging: false
    },
    browserNoActivityTimeout: 30000
  })
}
