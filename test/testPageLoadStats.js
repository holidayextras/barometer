/* global window */
'use strict'
var assert = require('assert')
var sinon = require('sinon')
require('./_fakeDom.js')
require('../lib/pageLoadStats.js')
var transport = require('../lib/transport.js')

describe('Testing pageLoadStats', function () {
  before(function () {
    sinon.stub(transport, 'gauge')
    window.trigger('load')
  })
  after(function () {
    transport.gauge.restore()
  })

  it('should gauge page load times', function () {
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.unloadEventStart', 1)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.unloadEventEnd', 2)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.redirectStart', 3)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.redirectEnd', 4)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.fetchStart', 5)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domainLookupStart', 6)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domainLookupEnd', 7)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.connectStart', 8)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.connectEnd', 9)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.secureConnectionStart', 10)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.requestStart', 11)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.responseStart', 12)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.responseEnd', 13)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domLoading', 14)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domInteractive', 15)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domContentLoadedEventStart', 16)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domContentLoadedEventEnd', 17)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.domComplete', 18)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.loadEventStart', 19)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.loadEventEnd', 20)
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876/context_html.redirects', 2)
    assert.equal(transport.gauge.callCount, 21)
  })
})
