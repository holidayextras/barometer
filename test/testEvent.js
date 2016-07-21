'use strict'
var assert = require('assert')
var sinon = require('sinon')
require('./_fakeDom.js')
var event = require('../lib/event.js')

describe('Testing event', function () {
  describe('with addEventListener', function () {
    it('attaches the event', function (done) {
      var obj = {
        addEventListener: sinon.stub().yields()
      }
      var fn = function () {
        assert.ok(obj.addEventListener.calledWith('event', fn, false))
        done()
      }
      event(obj, 'event', fn)
    })
  })

  describe('with attachEvent', function () {
    it('attaches the event', function (done) {
      var obj = {
        attachEvent: sinon.stub().yields()
      }
      var fn = function () {
        assert.ok(obj.attachEvent.calledWith('onevent', fn))
        done()
      }
      event(obj, 'event', fn)
    })
  })

  describe('with nothing', function () {
    it('does nothing', function () {
      var obj = { }
      var fn = function () {
        throw new Error('Shouldnt get here')
      }
      event(obj, 'event', fn)
    })
  })
})
