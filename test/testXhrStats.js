/* global window */
'use strict'
var sinon = require('sinon')
require('./_fakeDom.js')
require('../lib/xhrStats.js')
var transport = require('../lib/transport.js')

describe('Testing xhrStats', function () {
  before(function () {
    sinon.stub(transport, 'timing')
    sinon.stub(transport, 'count')
    window.clock = sinon.useFakeTimers()
    var xhr = new window.XMLHttpRequest()
    xhr.open('POST', 'www.example.com/foo', true)
    xhr.send('datadatadatadata')
    window.clock.tick(1)
  })
  after(function () {
    transport.timing.restore()
    transport.count.restore()
    window.clock.restore()
  })

  it('should measure XHR timings', function () {
    sinon.assert.calledWith(transport.timing, 'client_xhr_seconds{method="post",host="www.example.com",path="foo",tag="processed"}', 0)
    sinon.assert.calledWith(transport.timing, 'client_xhr_seconds{method="post",host="www.example.com",path="foo",tag="unsent"}', 0)
    sinon.assert.calledWith(transport.timing, 'client_xhr_seconds{method="post",host="www.example.com",path="foo",tag="opened"}', 0)
    sinon.assert.calledWith(transport.timing, 'client_xhr_seconds{method="post",host="www.example.com",path="foo",tag="headers_received"}', 0)
    sinon.assert.calledWith(transport.timing, 'client_xhr_seconds{method="post",host="www.example.com",path="foo",tag="loading"}', 0)
    sinon.assert.calledWith(transport.timing, 'client_xhr_response_bytes{method="post",host="www.example.com",path="foo",httpCode="200"}', 11)
    sinon.assert.calledWith(transport.count, 'client_xhr_response_events{method="post",host="www.example.com",path="foo",httpCode="200"}')
  })
})
