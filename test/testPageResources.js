/* global window */
'use strict'
var sinon = require('sinon')
var assert = require('assert')
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
        entryType: 'type1',
        stat1: 123
      },
      {
        name: 'http://bar.com/foo.js',
        entryType: 'type2',
        stat2: 223
      },
      {
        name: 'http://example.com/bar.js',
        entryType: 'type3',
        stat2: 100
      }
    ]
    var subsequentEntries = [
      {
        name: 'http://foo.com/bar.js',
        entryType: 'type1',
        stat1: 723
      },
      {
        name: 'http://bar.com/foo.js',
        entryType: 'type2',
        stat2: 823
      }
    ]
    getEntries.onFirstCall().returns(entries)
    getEntries.onSecondCall().returns(entries.concat(subsequentEntries))
    window.barometer.resources = [
      { domain: 'foo.com', metrics: [ 'stat1' ] },
      { path: /foo\.js$/, metrics: [ 'stat2' ] }
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
    sinon.assert.calledWith(transport.gauge, 'resources.type1.foo_com.bar_js.stat1', 123)
    sinon.assert.calledWith(transport.gauge, 'resources.type2.bar_com.foo_js.stat2', 223)
    assert.equal(transport.gauge.callCount, 2)
    window.clock.tick(600)
    sinon.assert.calledWith(transport.gauge, 'resources.type1.foo_com.bar_js.stat1', 723)
    sinon.assert.calledWith(transport.gauge, 'resources.type2.bar_com.foo_js.stat2', 823)
    assert.equal(transport.gauge.callCount, 4)
  })
})
