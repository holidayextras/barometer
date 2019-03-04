'use strict'

var customLaunchers = {
  win10chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 10'
  },
  win10firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Windows 10'
  },
  osxSafari: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 12.00'
  },
  iosSafari: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 12.00'
  },
  win10edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10'
  },
  win10ie11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 10'
  },
  win7ie9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9.0'
  }
}

module.exports = function (config) {
  config.set({
    sauceLabs: {
      testName: 'barometer full stack tests'
    },
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    frameworks: [ 'mocha' ],
    reporters: [ 'spec', 'saucelabs' ],
    plugins: [ 'karma-mocha', 'karma-sauce-launcher', 'karma-spec-reporter' ],
    singleRun: true,
    autoWatch: false,
    files: [
      'dist/barometer.min.js',
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
