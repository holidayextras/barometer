/* global window */
'use strict'
var sinon = require('sinon')
require('./_fakeDom.js')
require('../lib/xhrStats.js')
var transport = require('../lib/transport.js')

describe('Testing xhrStats', function () {
  before(function () {
    sinon.stub(transport, 'gauge')
    sinon.stub(transport, 'count')
    window.clock = sinon.useFakeTimers()
    var xhr = new window.XMLHttpRequest()
    xhr.open('POST', 'www.example.com/foo', true)
    xhr.send('datadatadatadata')
    window.clock.tick(151)
  })
  after(function () {
    transport.gauge.restore()
    transport.count.restore()
    window.clock.restore()
  })

  it('should measure XHR timings', function () {
    sinon.assert.calledWith(transport.gauge, 'xhr.timing.post.www_example_com.foo.processed', 151)
    sinon.assert.calledWith(transport.gauge, 'xhr.timing.post.www_example_com.foo.unsent', 0)
    sinon.assert.calledWith(transport.gauge, 'xhr.timing.post.www_example_com.foo.opened', 0)
    sinon.assert.calledWith(transport.gauge, 'xhr.timing.post.www_example_com.foo.headers_received', 0)
    sinon.assert.calledWith(transport.gauge, 'xhr.timing.post.www_example_com.foo.loading', 0)
    sinon.assert.calledWith(transport.gauge, 'xhr.size.post.www_example_com.foo.200', 11)
    sinon.assert.calledWith(transport.count, 'xhr.responses.post.www_example_com.foo.200')
  })
})
