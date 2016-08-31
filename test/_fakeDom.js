require('sinon')
var fakeDom = { }
if (typeof window === 'undefined') {
  global.window = global.document = { }
  fakeDom.faked = true
}
var events = { }

window.addEventListener = function (evt, fn) {
  var eventCallbacks = events[evt] || []
  eventCallbacks.push(fn)
  events[evt] = eventCallbacks
}

window.trigger = function (evt) {
  for (var i in events[evt]) {
    events[evt][i]()
  }
}

window.readyState = 'loading'
if (!window.history) window.history = { }

if (!window.location) {
  window.location = {
    host: 'localhost_9876',
    href: 'localhost_9876',
    hash: '/context_html?foo=bar'
  }
}

window.performance = {
  timing: {
    navigationStart: 1,
    unloadEventStart: 2,
    unloadEventEnd: 3,
    redirectStart: 4,
    redirectEnd: 5,
    fetchStart: 6,
    domainLookupStart: 7,
    domainLookupEnd: 8,
    connectStart: 9,
    connectEnd: 10,
    secureConnectionStart: 11,
    requestStart: 12,
    responseStart: 13,
    responseEnd: 14,
    domLoading: 15,
    domInteractive: 16,
    domContentLoadedEventStart: 17,
    domContentLoadedEventEnd: 18,
    domComplete: 19,
    loadEventStart: 20,
    loadEventEnd: 21,
    toJSON: function () {
      var clone = {}
      for (var i in this) {
        clone[i] = this[i]
      }
      delete clone.toJSON
      return clone
    }
  },
  navigation: {
    redirectCount: 2
  }
}

window.ProgressEvent = true

window.XMLHttpRequest = function () {
  var events = { }

  var req = {
    headers: {},
    readyState: 0,
    status: 200,
    responseText: 'lorem ipsum',
    addEventListener: function (evt, fn) {
      events[evt] = fn
    },
    trigger: function () {
      var args = Array.prototype.slice.call(arguments)
      var evt = args.shift()
      if (typeof events[evt] === 'function') {
        events[evt].apply(req, args)
      }
    },
    setRequestHeader: function (key, value) {
      req.headers[key] = value
    },
    send: function () { },
    open: function (a, b) {
      req.method = a
      req.url = b
      fakeDom.lastXhr = req
      req.trigger('readystatechange')
      req.readyState++
      req.trigger('readystatechange')
      req.readyState++
      req.trigger('readystatechange')
      req.readyState++
      req.trigger('readystatechange')

      req.trigger('progress', { loaded: 10, total: 100 })
      setTimeout(function () {
        req.trigger('progress', { loaded: 40, total: 100 })
      }, 50)
      setTimeout(function () {
        req.trigger('progress', { loaded: 70, total: 100 })
      }, 100)
      setTimeout(function () {
        req.trigger('progress', { loaded: 100, total: 100 })
        req.trigger('loadend')
      }, 150)
    }
  }
  return req
}

require('../')
window.barometer.url = 'https://localhost:16006'

module.exports = fakeDom
