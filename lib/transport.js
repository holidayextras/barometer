/* global window document */
'use strict'
var transport = module.exports = {}

var event = require('./event.js')
var xhrStats = require('./xhrStats')
var barometer = require('./barometer.js')

transport.url = 'XXXXX'

transport._initialiseBuffer = function () {
  transport.buffer = {
    gauges: { },
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

transport.gauge = function (metric, value) {
  transport.buffer.gauges[metric] = transport.buffer.gauges[metric] || [ ]
  transport.buffer.gauges[metric].push(value)
  transport._triggerFlushBuffer()
  transport.bufferSize++
  if (window.barometer.debug) console.log('gauge', metric, value)
}

var bufferFlush = null
transport._triggerFlushBuffer = function () {
  if (bufferFlush && (transport.bufferSize < 100)) {
    clearTimeout(bufferFlush)
  }
  bufferFlush = setTimeout(transport._flushBuffer, 5000)
}

transport._flushBuffer = function () {
  if (transport.bufferSize === 0) return
  if (!barometer.url) return

  if (bufferFlush) {
    clearTimeout(bufferFlush)
    bufferFlush = null
  }

  var bufferToSend = transport.buffer
  transport._initialiseBuffer()

  var url = barometer.url
  var xhr = new xhrStats._XMLHttpRequest()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(bufferToSend))
  xhr.timeout = 4 * 1000
  // xhr.onload = function ()e) { }
  // xhr.onerror = function ()e) { }
  // xhr.ontimeout = function ()) { }
}
event(window, 'beforeunload', transport._flushBuffer)
event(window, 'unload', transport._flushBuffer)
event(window, 'pagehide', transport._flushBuffer)
event(document, 'mouseout', function (e) {
  e = e || window.event
  e = e.relatedTarget || e.toElement
  if (!e || e.nodeName === 'HTML') {
    transport._flushBuffer()
  }
})
