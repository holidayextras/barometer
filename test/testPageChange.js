/* global window */
'use strict'
var sinon = require('sinon')
var assert = require('assert')
require('./_fakeDom.js')
require('../lib/pageChange.js')
var transport = require('../lib/transport.js')

describe('Testing pageChange', function () {
  var pageChangedFired = false
  var onPageLoadedCounter = 0
  before(function (done) {
    var i
    sinon.stub(transport, 'gauge')
    sinon.stub(transport, 'count')
    window.barometer.onPageChanged(function () {
      pageChangedFired = true
    })
    window.barometer.oncePageLoaded(function () {
      onPageLoadedCounter++
    })
    window.clock = sinon.useFakeTimers()
    window.trigger('popstate')
    for (i = 0; i < 20; i++) window.clock.tick(25)
    window.clock.setSystemTime((new Date()).getTime() + 100)
    for (i = 0; i < 20; i++) window.clock.tick(25)
    done()
  })
  after(function () {
    transport.gauge.restore()
    transport.count.restore()
    window.clock.restore()
  })

  it('should measure load times', function () {
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876.context_html.dynamic', 750)
    sinon.assert.calledWith(transport.count, 'pageload.localhost_9876.context_html.visits')
    assert.equal(pageChangedFired, true, 'onPageChanged event should have been triggered')
    assert.equal(onPageLoadedCounter, 1, 'onPageLoaded event should have been triggered')
  })

  it('should measure engagement', function () {
    window.clock.tick(100)
    window.trigger('popstate')
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876.context_html.engagement', 325)
    assert.equal(onPageLoadedCounter, 1, 'onPageLoaded event should NOT have been triggered')
  })
})
