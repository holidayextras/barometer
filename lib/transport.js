/* global window document */
'use strict'
var transport = module.exports = {}

var xhrStats = require('./xhrStats')
var barometer = require('./barometer.js')

transport.url = 'XXXXX'

transport._initialiseBuffer = function () {
  transport.buffer = {
    project: null,
    timings: { },
    counters: { }
  }
  transport.bufferSize = 0
}
transport._initialiseBuffer()

transport.count = function (metric) {
  transport.buffer.counters[metric] = transport.buffer.counters[metric] || 0
  transport.buffer.counters[metric]++
  transport._triggerFlushBuffer()
  transport.bufferSize++
  if (window.barometer.debug) console.log('count', metric)
}

transport.timing = function (metric, value) {
  transport.buffer.timings[metric] = transport.buffer.timings[metric] || [ ]
  transport.buffer.timings[metric].push(value)
  transport._triggerFlushBuffer()
  transport.bufferSize++
  if (window.barometer.debug) console.log('timing', metric, value)
}

var bufferFlush = null
transport._triggerFlushBuffer = function () {
  if (bufferFlush && (transport.bufferSize < 100)) {
    clearTimeout(bufferFlush)
  }
  bufferFlush = setTimeout(transport._flushBuffer, 5000)
}

transport._flushBuffer = function (pageEnd) {
  if (transport.bufferSize === 0) return
  if (!barometer.url) return

  if (bufferFlush) {
    clearTimeout(bufferFlush)
    bufferFlush = null
  }

  var bufferToSend = transport.buffer
  bufferToSend.project = barometer.project
  transport._initialiseBuffer()

  var url = barometer.url

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, JSON.stringify(bufferToSend))
  } else {
    var xhr = new xhrStats._XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.timeout = 4 * 1000
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(bufferToSend))
  }
}
