/* global window */
'use strict'
var sinon = require('sinon')
require('./_fakeDom.js')
var measures = require('../lib/measures.js')
var transport = require('../lib/transport.js')

describe('Testing measures', function () {
  before(function (done) {
    sinon.stub(transport, 'timing')
    window.clock = sinon.useFakeTimers()
    window.barometer.pageStartedAt = new Date()
    window.clock.setSystemTime((new Date()).getTime() + 100)
    done()
  })
  after(function () {
    transport.timing.restore()
    window.clock.restore()
  })

  it('should measure times offset from page change start', function () {
    measures.offset('xxxxx')
    sinon.assert.calledWith(transport.timing, 'client_pageload_seconds{host="localhost:9876",path="context.html",measure="xxxxx"}', 100)
  })
})
