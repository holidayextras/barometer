/* global window */
'use strict'
var measures = module.exports = {}

var barometer = require('./barometer.js')
var pageLoadStats = require('./pageLoadStats.js')
var transport = require('./transport.js')

measures.offset = function (stat) {
  var timeDiff = (new Date()) - barometer.pageStartedAt
  var metric = pageLoadStats._createTimingName(stat)
  transport.timing(metric, timeDiff)
}
