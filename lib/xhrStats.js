/* global window */
'use strict'
var xhrStats = module.exports = {}

var event = require('./event.js')
var transport = require('./transport.js')
var urlSanitiser = require('./urlSanitiser.js')
xhrStats._XMLHttpRequest = window.XMLHttpRequest
var xhrStates = [ 'unsent', 'opened', 'headers_received', 'loading', 'done' ]

xhrStats._createGaugeName = function (stat) {
  return 'xhr.' + stat
}

xhrStats._normaliseStats = function (stats, offset) {
  var normalisedStats = { }

  for (var stat in stats) {
    if (stat[0] === '_') continue
    if (stats[stat] === 0) continue
    normalisedStats[stat] = stats[stat] - offset
  }

  return normalisedStats
}

xhrStats._logMetrics = function (data) {
  var safeUrl = urlSanitiser(data.url)
  var metricPostfix, metric
  var normalisedTimings = xhrStats._normaliseStats(data.readyStateTimes, data.offset)

  for (var stat in normalisedTimings) {
    metricPostfix = 'timing.' + data.type + '.' + safeUrl + '.' + stat
    metric = xhrStats._createGaugeName(metricPostfix)
    transport.gauge(metric, normalisedTimings[stat])
  }

  metricPostfix = 'responses.' + data.type + '.' + safeUrl + '.' + data.request.status
  metric = xhrStats._createGaugeName(metricPostfix)
  transport.count(metric)

  metricPostfix = 'size.' + data.type + '.' + safeUrl + '.' + data.request.status
  metric = xhrStats._createGaugeName(metricPostfix)
  transport.gauge(metric, (data.request.responseText || '').length)
}

window.XMLHttpRequest = function () {
  var req = new xhrStats._XMLHttpRequest()
  var readyStateTimes = {}
  var _open = req.open
  var offset, type, url

  event(req, 'readystatechange', function () {
    readyStateTimes[xhrStates[req.readyState]] = new Date()
  })

  event(req, 'loadend', function (event) {
    setTimeout(function () {
      readyStateTimes.processed = new Date()
      return xhrStats._logMetrics({
        type: type.toLowerCase(),
        url: url,
        readyStateTimes: readyStateTimes,
        offset: offset,
        request: req
      })
    }, 0)
  })

  req.open = function (atype, aurl) {
    offset = new Date()
    type = atype
    url = aurl
    return _open.apply(req, arguments)
  }
  return req
}
