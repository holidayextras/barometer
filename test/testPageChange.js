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
    sinon.stub(transport, 'timing')
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
    transport.timing.restore()
    transport.count.restore()
    window.clock.restore()
  })

  it('should measure load times', function () {
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html",measure="dynamic"}', 750)
    sinon.assert.calledWith(transport.count, 'client_pageload_event{host="localhost:9876",path="context.html",measure="visits"}')
    assert.equal(pageChangedFired, true, 'onPageChanged event should have been triggered')
    assert.equal(onPageLoadedCounter, 1, 'onPageLoaded event should have been triggered')
  })

  it('should measure engagement', function () {
    window.clock.tick(100)
    window.trigger('popstate')
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html",measure="engagement"}', 325)
    assert.equal(onPageLoadedCounter, 1, 'onPageLoaded event should NOT have been triggered')
  })
})
