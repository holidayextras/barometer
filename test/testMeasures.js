/* global window */
'use strict'
var sinon = require('sinon')
require('./_fakeDom.js')
var measures = require('../lib/measures.js')
var transport = require('../lib/transport.js')

describe('Testing measures', function () {
  before(function (done) {
    sinon.stub(transport, 'gauge')
    window.clock = sinon.useFakeTimers()
    window.barometer.pageStartedAt = new Date()
    window.clock.setSystemTime((new Date()).getTime() + 100)
    done()
  })
  after(function () {
    transport.gauge.restore()
    window.clock.restore()
  })

  it('should measure times offset from page change start', function () {
    measures.offset('xxxxx')
    sinon.assert.calledWith(transport.gauge, 'pageload.localhost_9876.context_html.xxxxx', 100)
  })
})
