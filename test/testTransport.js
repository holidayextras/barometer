/* global window */
'use strict'
var assert = require('assert')
var sinon = require('sinon')
require('./_fakeDom.js')
var transport = require('../lib/transport.js')

describe('Testing transport', function () {
  beforeEach(function () {
    window.clock = sinon.useFakeTimers()
    transport._initialiseBuffer()
  })
  afterEach(function () {
    window.clock.restore()
  })

  describe('count', function () {
    beforeEach(function () {
      sinon.stub(transport, '_triggerFlushBuffer')
    })
    afterEach(function () {
      transport._triggerFlushBuffer.restore()
    })
    it('should add to the buffer', function () {
      transport.count('testing')
      assert.deepEqual(transport.buffer, {
        project: null,
        timings: { },
        counters: { 'testing': 1 }
      })
      transport.count('testing')
      assert.deepEqual(transport.buffer, {
        project: null,
        timings: { },
        counters: { 'testing': 2 }
      })
      transport.count('foobar')
      assert.deepEqual(transport.buffer, {
        project: null,
        timings: { },
        counters: { 'foobar': 1, 'testing': 2 }
      })
      assert.equal(transport._triggerFlushBuffer.callCount, 3)
    })
  })

  describe('timing', function () {
    beforeEach(function () {
      sinon.stub(transport, '_triggerFlushBuffer')
    })
    afterEach(function () {
      transport._triggerFlushBuffer.restore()
    })
    it('should add to the buffer', function () {
      transport.timing('testing', 1)
      assert.deepEqual(transport.buffer, {
        project: null,
        timings: { 'testing': [ 1 ] },
        counters: { }
      })
      transport.timing('testing', 2)
      assert.deepEqual(transport.buffer, {
        project: null,
        timings: { 'testing': [ 1, 2 ] },
        counters: { }
      })
      transport.timing('foobar', 3)
      assert.deepEqual(transport.buffer, {
        project: null,
        timings: { 'testing': [ 1, 2 ], 'foobar': [ 3 ] },
        counters: { }
      })
      assert.equal(transport._triggerFlushBuffer.callCount, 3)
    })
  })

  describe('triggerFlushBuffer', function () {
    beforeEach(function () {
      sinon.stub(transport, '_flushBuffer')
    })
    afterEach(function () {
      transport._flushBuffer.restore()
    })

    it('flushes the buffer after 5 seconds', function () {
      transport._triggerFlushBuffer()
      assert.equal(transport._flushBuffer.callCount, 0)
      window.clock.tick(1000 * 4)
      assert.equal(transport._flushBuffer.callCount, 0)
      window.clock.tick(1000 * 5)
      assert.equal(transport._flushBuffer.callCount, 1)
    })

    it('debounces on new requests', function () {
      transport._triggerFlushBuffer()
      window.clock.tick(1000 * 4)
      transport._triggerFlushBuffer()
      assert.equal(transport._flushBuffer.callCount, 0)
      window.clock.tick(1000 * 4)
      assert.equal(transport._flushBuffer.callCount, 0)
      window.clock.tick(1000 * 5)
      assert.equal(transport._flushBuffer.callCount, 1)
    })

    it('wont debounce if the buffer is big', function () {
      transport.bufferSize = 100
      transport._triggerFlushBuffer()
      window.clock.tick(1000 * 4)
      transport._triggerFlushBuffer()
      assert.equal(transport._flushBuffer.callCount, 0)
      window.clock.tick(1000 * 1)
      assert.equal(transport._flushBuffer.callCount, 1)
    })
  })
})
