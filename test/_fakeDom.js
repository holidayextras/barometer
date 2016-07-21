require('sinon')
if (typeof window === 'undefined') {
  global.window = global.document = { }
}
var events = { }

window.addEventListener = function (evt, fn) {
  events[evt] = fn
}

window.trigger = function (evt) {
  events[evt]()
}

window.readyState = 'loading'
window.history = { }

if (!window.location) {
  window.location = {
    href: 'localhost_9876',
    hash: '#/context_html?foo=bar'
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
      delete this.toJSON
      return this
    }
  },
  navigation: {
    redirectCount: 2
  }
}

window.XMLHttpRequest = function () {
  var events = { }

  var req = {
    readyState: 0,
    status: 200,
    responseText: 'lorem ipsum',
    addEventListener: function (evt, fn) {
      events[evt] = fn
    },
    trigger: function (evt) {
      events[evt]()
    },
    send: function () { },
    open: function (a, b) {
      req.trigger('readystatechange')
      req.readyState++
      req.trigger('readystatechange')
      req.readyState++
      req.trigger('readystatechange')
      req.readyState++
      req.trigger('readystatechange')
      req.trigger('loadend')
    }
  }
  return req
}

require('../')
window.barometer.url = 'https://localhost:16006'
