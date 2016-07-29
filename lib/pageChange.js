/* global window */
'use strict'

var pageChange = module.exports = {}

var event = require('./event.js')
var pageLoadStats = require('./pageLoadStats.js')
var transport = require('./transport.js')
var barometer = require('./barometer.js')

var pageCounter = 0
var onPageChanged = [ ]
var pageLoadedAt, pageLoadedId, pageHasLoaded
pageChange._pageEnd = function () {
  transport.gauge(pageLoadedId, (new Date()) - pageLoadedAt)
}
pageChange._logPage = function () {
  var navStart = new Date()
  barometer.pageStartedAt = navStart
  transport.count(pageLoadStats._createGaugeName('visits'))
  if (pageLoadedAt) {
    pageChange._pageEnd()
  }
  pageCounter++
  var thisPage = pageCounter
  var maxLag = 0
  var lastLag = [ 9, 9, 9, 9, 9 ]
  var stop = false
  var delay = 25
  var metric = pageLoadStats._createGaugeName('dynamic')
  var done = function () {
    clearTimeout(timeout)
    pageHasLoaded = true
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
    if (pageCounter !== 1) return
    for (var j = 0; j < onPageChanged.length; j++) {
      onPageChanged[j]()
    }
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

pageChange._logPage()
if (window.history) {
  event(window, 'popstate', pageChange._logPage);
  (function (h) {
    if (!h) return
    var pushState = h.pushState
    h.pushState = function () {
      pageChange._logPage()
      return pushState.apply(h, arguments)
    }
  })(window.history)
} else {
  event(window, 'hashchange', pageChange._logPage)
}

pageChange.onPageChanged = function (cb) {
  onPageChanged.push(cb)
}

pageChange.oncePageLoaded = function (cb) {
  if (pageHasLoaded) return cb()
  var triggered = false
  pageChange.onPageChanged(function () {
    if (triggered) return
    triggered = true
    cb()
  })
}
