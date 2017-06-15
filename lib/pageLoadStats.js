/* global document window */
'use strict'
var pageLoadStats = module.exports = {}

var event = require('./event.js')
var barometer = require('./barometer.js')
var transport = require('./transport.js')
var urlSanitiser = require('./urlSanitiser.js')

pageLoadStats._normaliseStats = function (stats) {
  var normalisedStats = { }
  var offset = stats.navigationStart

  if (stats.toJSON) {
    stats = stats.toJSON()
  }
  for (var stat in stats) {
    if (stat === 'navigationStart') continue
    if (stats[stat] === 0) continue
    normalisedStats[stat] = stats[stat] - offset
  }

  if (stats.navigationStart !== 0) {
    normalisedStats.timeToFirstScript = barometer.pageStartedAt - stats.navigationStart
  }
  return normalisedStats
}

pageLoadStats._createCounterName = function (stat) {
  var safeUrl = urlSanitiser(window.location.href, window.location.hash)
  return 'client_pageload_event{host="' + safeUrl[0] + '",path="' + safeUrl[1] + '",measure="' + stat + '"}'
}

pageLoadStats._createTimingName = function (stat) {
  var safeUrl = urlSanitiser(window.location.href, window.location.hash)
  return 'client_pageload_seconds{host="' + safeUrl[0] + '",path="' + safeUrl[1] + '",measure="' + stat + '"}'
}

pageLoadStats._calculateStats = function () {
  var stats = window.performance.timing || { }
  var normalisedStats = pageLoadStats._normaliseStats(stats)
  var metric

  for (var stat in normalisedStats) {
    metric = pageLoadStats._createTimingName(stat)
    transport.timing(metric, normalisedStats[stat])
  }
}

if (typeof window.performance === 'object') {
  if (document.readyState === 'complete') {
    pageLoadStats._calculateStats()
  } else {
    event(window, 'load', pageLoadStats._calculateStats)
  }
}
