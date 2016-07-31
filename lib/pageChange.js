/* global window */
'use strict'
var pageChanged = module.exports = {}

var event = require('./event.js')
var pageLoadStats = require('./pageLoadStats.js')
var transport = require('./transport.js')

var pageCounter = 0
var onPageChanged = [ ]
var pageLoadedAt, pageLoadedId
pageChanged._pageEnd = function () {
  transport.gauge(pageLoadedId, (new Date()) - pageLoadedAt)
}
pageChanged._logPage = function () {
  transport.count(pageLoadStats._createGaugeName('visits'))
  if (pageLoadedAt) {
    pageChanged._pageEnd()
  }
  pageCounter++
  var navStart = new Date()
  var thisPage = pageCounter
  var maxLag = 0
  var lastLag = [ 9, 9, 9, 9, 9 ]
  var stop = false
  var delay = 25
  var metric = pageLoadStats._createGaugeName('dynamic')
  var done = function () {
    clearTimeout(timeout)
    pageLoadedAt = new Date()
    pageLoadedId = pageLoadStats._createGaugeName('engagement')
    var overhead = 25 * 5
    transport.gauge(metric, ((new Date()) - navStart) - overhead)
    for (var j = 0; j < onPageChanged.length; j++) {
      onPageChanged[j]()
    }
  }

  var timeout = setTimeout(function () {
    stop = true
  }, 6000)

  var computeEvLag = function () {
    var startDate = new Date()
    setTimeout(function () {
      var endDate = new Date()
      var newLag = (endDate - startDate) - delay
      if (newLag > maxLag) maxLag = newLag

      if (stop) return
      if (thisPage !== pageCounter) return done()

      lastLag.shift()
      lastLag.push(newLag)
      var totalLag = 0
      for (var i = 0; i < 5; i++) {
        totalLag += lastLag[i]
      }
      if ((totalLag < 5) && (maxLag > 25)) return done()
      setTimeout(computeEvLag, delay)
    }, delay)
  }
  computeEvLag()
}

pageChanged._logPage()
if (window.history) {
  event(window, 'popstate', pageChanged._logPage);
  (function (h) {
    if (!h) return
    var pushState = h.pushState
    h.pushState = function () {
      pageChanged._logPage()
      return pushState.apply(h, arguments)
    }
  })(window.history)
} else {
  event(window, 'hashchange', pageChanged._logPage)
}

pageChanged.onPageChanged = function (cb) {
  onPageChanged.push(cb)
}
