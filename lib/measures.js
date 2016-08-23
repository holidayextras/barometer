/* global window */
'use strict'
var measures = module.exports = {}

var barometer = require('./barometer.js')
var urlSanitiser = require('./urlSanitiser.js')
var transport = require('./transport.js')

measures.offset = function (stat) {
  var timeDiff = (new Date()) - barometer.pageStartedAt
  var safeUrl = urlSanitiser(window.location.href, window.location.hash)
  var metric = 'pageload.' + safeUrl + '.' + stat.replace(/[^a-z0-9-]/gi, '_')
  transport.gauge(metric, timeDiff)
}
