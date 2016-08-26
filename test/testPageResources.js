/* global window */
'use strict'
var sinon = require('sinon')
require('./_fakeDom.js')
var pageChange = require('../lib/pageChange.js')
var transport = require('../lib/transport.js')
var pageResources = require('../lib/pageResources.js')

describe('Testing pageResources', function () {
  before(function () {
    sinon.stub(transport, 'gauge')
    sinon.stub(pageChange, 'onPageChanged', function (callback) {
      setTimeout(callback, 500)
      return callback()
    })
    window.clock = sinon.useFakeTimers()
    var getEntries = sinon.stub()
    window.performance.getEntries = getEntries
    var entries = [
      {
        name: 'http://foo.com/bar.js?blarg',
        stat1: 123
      },
      {
        name: 'http://bar.com/foo.js',
        stat2: 223
      },
      {
        name: 'http://example.com/bar.js',
        stat2: 100
      },
      {
        name: 'http://example.com/1234567890.payload.gz.js',
        stat1: 100
      }
    ]
    var subsequentEntries = [
      {
        name: 'http://foo.com/bar.js',
        stat1: 723
      },
      {
        name: 'http://bar.com/foo.js',
        stat2: 823
      }
    ]
    getEntries.onFirstCall().returns(entries)
    getEntries.onSecondCall().returns(entries.concat(subsequentEntries))
    window.barometer.resources = [
      { domain: 'foo.com', metrics: [ 'stat1' ] },
      { path: /foo\.js$/, metrics: [ 'stat2' ] },
      { path: /payload(\.gz)?\.js$/, metrics: [ 'stat1' ], rename: 'payload' }
    ]
    pageResources.initialise()
  })
  after(function () {
    transport.gauge.restore()
    pageChange.onPageChanged.restore()
    window.performance.getEntries = null
    window.clock.restore()
  })

  it('should measure resource timings', function () {
    sinon.assert.calledWith(transport.gauge, 'resources.foo_com.bar_js.stat1', 123)
    sinon.assert.calledWith(transport.gauge, 'resources.bar_com.foo_js.stat2', 223)
    sinon.assert.calledWith(transport.gauge, 'resources.example_com.payload.stat1', 100)
    window.clock.tick(600)
    sinon.assert.calledWith(transport.gauge, 'resources.foo_com.bar_js.stat1', 723)
    sinon.assert.calledWith(transport.gauge, 'resources.bar_com.foo_js.stat2', 823)
  })
})
