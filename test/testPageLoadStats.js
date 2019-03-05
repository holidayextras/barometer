/* global window */
'use strict'
var assert = require('assert')
var sinon = require('sinon')
require('./_fakeDom.js')
require('../lib/pageLoadStats.js')
var transport = require('../lib/transport.js')

describe('Testing pageLoadStats', function () {
  before(function () {
    sinon.stub(transport, 'timing')
    window.barometer.pageStartedAt = 6
    window.trigger('load')
  })
  after(function () {
    transport.timing.restore()
  })

  it('should timing page load times', function () {
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="unloadEventStart"}', 1)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="unloadEventEnd"}', 2)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="redirectStart"}', 3)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="redirectEnd"}', 4)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="fetchStart"}', 5)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domainLookupStart"}', 6)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domainLookupEnd"}', 7)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="connectStart"}', 8)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="connectEnd"}', 9)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="secureConnectionStart"}', 10)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="requestStart"}', 11)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="responseStart"}', 12)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="responseEnd"}', 13)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domLoading"}', 14)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domInteractive"}', 15)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domContentLoadedEventStart"}', 16)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domContentLoadedEventEnd"}', 17)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="domComplete"}', 18)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="loadEventStart"}', 19)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="loadEventEnd"}', 20)
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html/",measure="timeToFirstScript"}', 5)
    assert.equal(transport.timing.callCount, 21)
  })
})
