/* global window */
'use strict'
var xhrStats = module.exports = {}

var event = require('./event.js')
var transport = require('./transport.js')
var urlSanitiser = require('./urlSanitiser.js')
xhrStats._XMLHttpRequest = window.XMLHttpRequest
var xhrStates = [ 'unsent', 'opened', 'headers_received', 'loading', 'done' ]

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
  var metric
  var normalisedTimings = xhrStats._normaliseStats(data.readyStateTimes, data.offset)

  for (var stat in normalisedTimings) {
    metric = 'client_xhr_seconds{method="' + data.type + '",host="' + safeUrl[0] + '",path="' + safeUrl[1] + '",tag="' + stat + '"}'
    transport.timing(metric, normalisedTimings[stat])
  }

  metric = 'client_xhr_response_events{method="' + data.type + '",host="' + safeUrl[0] + '",path="' + safeUrl[1] + '",httpCode="' + data.request.status + '"}'
  transport.count(metric)

  metric = 'client_xhr_response_bytes{method="' + data.type + '",host="' + safeUrl[0] + '",path="' + safeUrl[1] + '",httpCode="' + data.request.status + '"}'
  transport.timing(metric, (data.request.responseText || '').length)
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
      var data = {
        type: type.toLowerCase(),
        url: url,
        readyStateTimes: readyStateTimes,
        offset: offset,
        request: req
      }
      try {
        xhrStats._logMetrics(data)
      } catch (e) { }
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
