/* global window */
'use strict'
var xhrStats = module.exports = {}

var event = require('./event.js')
var transport = require('./transport.js')
var urlSanitiser = require('./urlSanitiser.js')
xhrStats._XMLHttpRequest = window.XMLHttpRequest
var xhrStates = [ 'UNSENT', 'OPENED', 'HEADERS_RECEIVED', 'LOADING', 'DONE' ]

xhrStats._createGaugeName = function (stat) {
  return 'xhr.' + stat
}

xhrStats._normaliseStats = function (stats, offset, total) {
  var normalisedStats = {
    total: total
  }

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
  var normalisedTimings = xhrStats._normaliseStats(data.readyStateTimes, data.offset, data.total)

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
  try {
    var readyStateTimes = {}
    var _open = req.open
    var _send = req.send

    req.open = function (type, url) {
      try {
        var offset = new Date()

        event(req, 'readystatechange', function () {
          readyStateTimes[xhrStates[req.readyState]] = new Date()
        }, false)

        event(req, 'loadend', function (event) {
          return xhrStats._logMetrics({
            type: type,
            url: url,
            readyStateTimes: readyStateTimes,
            offset: offset,
            total: (new Date()) - offset,
            request: req
          })
        }, false)
      } catch (e) {
        /* Doh */
      }

      return _open.apply(req, arguments)
    }

    req.send = function () {
      return _send.apply(req, arguments)
    }
  } catch (e) {
    /* Doh */
  }
  return req
}
