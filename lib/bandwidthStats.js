/* global document window */
'use strict'
var bandwidthStats = module.exports = {}

var pageChange = require('./pageChange')
var xhrStats = require('./xhrStats')
var event = require('./event.js')
var transport = require('./transport.js')

bandwidthStats._writeCookie = function (maxAge) {
  if (!maxAge) maxAge = 60 * 60 * 24
  var runAt = new Date().getTime()
  var expires = runAt + maxAge * 1000
  document.cookie = 'barometer-bandwidth-run-at=' + runAt + '; expires=' + new Date(expires).toUTCString()
}

bandwidthStats._hasCookie = function () {
  return document.cookie && document.cookie.match(/barometer\-bandwidth\-run\-at/)
}

bandwidthStats._logResult = function (result) {
  var total = 0
  for (var i in result) {
    total = total + result[i]
  };

  transport.gauge('bandwidth', total / result.length)
}

bandwidthStats._calculateStats = function (config) {
  var url = config.url || 'https://s3-eu-west-1.amazonaws.com/hx-barometer/test'
  var size = config.size || 10240000
  var timeout = (config.length || 5) * 1000
  var xhr = new xhrStats._XMLHttpRequest()
  window.barometer._lastBandwidthXhr = xhr // We leave this reference here for testing
  var results = []
  var lastLoaded, lastNow
  event(xhr, 'progress', function (event) {
    var now = new Date()
    if (lastLoaded && lastNow) {
      var percentageProgress = (event.loaded - lastLoaded) / event.total
      var amountLoaded = size * percentageProgress
      // Times 8 for bits to bytes and times 1000 for ms to s
      results.push(8 * 1000 * amountLoaded / (now - lastNow))
    }
    lastLoaded = event.loaded
    lastNow = now
  })

  event(xhr, 'loadend', function (event) {
    bandwidthStats._logResult(results)
  })

  xhr.timeout = timeout
  xhr.open('GET', url, true)
  xhr.send()
}

bandwidthStats._fired = false

bandwidthStats._detectAndTriggerIfShouldCalculate = function () {
  var config = window.barometer.bandwidth

  if (!config || bandwidthStats._fired || bandwidthStats._hasCookie() || !window.ProgressEvent) return
  bandwidthStats._fired = true
  var every = config.every || 60 * 60 * 24
  bandwidthStats._writeCookie(every)
  var defer = config.defer
  if (!defer && defer !== 0) defer = 5
  setTimeout(function () {
    bandwidthStats._calculateStats(config)
  }, defer * 1000)
}

pageChange.oncePageLoaded(bandwidthStats._detectAndTriggerIfShouldCalculate)
