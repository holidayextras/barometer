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

pageLoadStats._createGaugeName = function (stat) {
  var safeUrl = urlSanitiser(window.location.href, window.location.hash)
  return 'pageload.' + safeUrl + '.' + stat.replace(/[^a-z0-9-]/gi, '_')
}

pageLoadStats._calculateStats = function () {
  var stats = window.performance.timing || { }
  var normalisedStats = pageLoadStats._normaliseStats(stats)
  var metric

  for (var stat in normalisedStats) {
    metric = pageLoadStats._createGaugeName(stat)
    transport.gauge(metric, normalisedStats[stat])
  }

  var redirects = (window.performance.navigation || { }).redirectCount || 0
  metric = pageLoadStats._createGaugeName('redirects')
  transport.gauge(metric, redirects)
}

if (typeof window.performance === 'object') {
  if (document.readyState === 'complete') {
    pageLoadStats._calculateStats()
  } else {
    event(window, 'load', pageLoadStats._calculateStats)
  }
}
