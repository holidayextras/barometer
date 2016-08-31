/* global window */
'use strict'
var assert = require('assert')
var sinon = require('sinon')
var fakeDom = require('./_fakeDom.js')
var bandwidthStats = require('../lib/bandwidthStats.js')
var transport = require('../lib/transport.js')

if (window.ProgressEvent) {
  describe('Testing bandwidthStats', function () {
    var triggerLoad = function () {
      bandwidthStats._detectAndTriggerIfShouldCalculate()
    }

    beforeEach(function () {
      window.clock = sinon.useFakeTimers(new Date().getTime())
      sinon.stub(transport, 'gauge')
      delete fakeDom.lastXhr
    })

    afterEach(function () {
      delete fakeDom.lastXhr
      if (fakeDom.faked) {
        delete document.cookie
      } else {
        document.cookie = 'barometer-bandwidth-run-at=1; expires=' + new Date(0).toUTCString()
      }
      bandwidthStats._fired = false
      transport.gauge.restore()
      window.clock.restore()
    })

    context('when bandwidth has not been enabled via config (default behaviour)', function () {
      it('does nothing', function () {
        triggerLoad()
        window.clock.tick(5100)
        sinon.assert.neverCalledWith(transport.gauge, 'bandwidth')
      })
    })

    context('when the bandwidthStats module has been enabled', function () {
      beforeEach(function () {
        window.barometer.bandwidth = {}
      })

      it('measures and gauges the value after the default 5 seconds deferment', function () {
        triggerLoad()
        var expectedBandwidth = (8 * 10240000 * 0.9) / 0.150 // This is the default test size converted to bits, times by the percentage we observed, divided by the number of seconds it took.
        window.clock.tick(4999)
        assert.equal(typeof fakeDom.lastXhr, 'undefined')
        window.clock.tick(1)
        assert.equal(fakeDom.lastXhr.timeout, 5000)
        assert.equal(fakeDom.lastXhr.method, 'GET')
        assert.equal(fakeDom.lastXhr.url, 'https://s3-eu-west-1.amazonaws.com/hx-barometer/test')
        window.clock.tick(150)
        sinon.assert.calledWith(transport.gauge, 'bandwidth', expectedBandwidth)
      })

      context('with a 1 second defer config option', function () {
        beforeEach(function () {
          window.barometer.bandwidth.defer = 1
        })
        afterEach(function () {
          window.barometer.bandwidth.defer = 0
        })
        it('overides the default 5 second value', function () {
          triggerLoad()
          window.clock.tick(999)
          assert.equal(typeof fakeDom.lastXhr, 'undefined')
          window.clock.tick(1)
          assert.notEqual(typeof fakeDom.lastXhr, 'undefined')
        })
      })

      context('with a 0 second defer config option', function () {
        beforeEach(function () {
          window.barometer.bandwidth = { defer: 0 }
        })

        it('sets a cookie to prevent running more often than the default 1 day', function () {
          triggerLoad()
          if (fakeDom.faked) {
            var now = new Date().getTime()
            var expectedExpires = new Date(now + 24 * 60 * 60 * 1000).toUTCString().replace(/\d\d( GMT)?$/, '\\d\\d')
            var expectedCookie = new RegExp('barometer-bandwidth-run-at=\\d+; expires=' + expectedExpires)
            assert.ok(document.cookie.match(expectedCookie))
          } else {
            // Its not possible to forward time in a way that expires the cookie,
            // or read what its expiry is in a browser.
            assert.ok(document.cookie.match(/barometer\-bandwidth\-run\-at=\d+/))
          }
        })

        context('and bandwidth has already been measured inside the `every` config value', function () {
          beforeEach(function () {
            document.cookie = 'barometer-bandwidth-run-at=1'
          })
          afterEach(function () {
            if (fakeDom.faked) delete document.cookie
          })
          it('does nothing', function () {
            triggerLoad()
            window.clock.tick(150)
            sinon.assert.neverCalledWith(transport.gauge, 'bandwidth')
          })
        })

        context('with a `every` config option', function () {
          beforeEach(function () {
            window.barometer.bandwidth.every = 60
          })
          afterEach(function () {
            delete window.barometer.bandwidth.every
          })
          it('overides the default 1 day value', function () {
            triggerLoad()
            // window.clock.tick(150)
            if (fakeDom.faked) {
              var now = new Date().getTime()
              var expectedExpires = new Date(now + 60 * 1000).toUTCString().replace(/\d\d( GMT)?$/, '\\d\\d')
              var expectedCookie = new RegExp('barometer-bandwidth-run-at=\\d+; expires=' + expectedExpires)
              assert.ok(document.cookie.match(expectedCookie))
            } else {
              // Its not possible to forward time in a way that expires the cookie,
              // or read what its expiry is in a browser.
              assert.ok(document.cookie.match(/barometer\-bandwidth\-run\-at=\d+/))
            }
          })
        })

        context('with a `url` and `size` config option', function () {
          beforeEach(function () {
            window.barometer.bandwidth.url = 'https://my-test-resource'
            window.barometer.bandwidth.size = 10240000 / 10
          })
          afterEach(function () {
            delete window.barometer.bandwidth.url
            delete window.barometer.bandwidth.size
          })
          it('overides the default values', function () {
            triggerLoad()
            window.clock.tick(150)
            var expectedBandwidth = (8 * 10240000 * 0.9) / (0.150 * 10)  // This is the default test size converted to bits, times by the percentage we observed, divided by the number of seconds it took times the reduced size
            assert.equal(fakeDom.lastXhr.url, 'https://my-test-resource')
            sinon.assert.calledWith(transport.gauge, 'bandwidth', expectedBandwidth)
          })
        })

        context('when the length config option has been set', function () {
          beforeEach(function () {
            window.barometer.bandwidth.length = 10
          })
          afterEach(function () {
            delete window.barometer.bandwidth.length
          })
          it('uses it as the XHR timeout value', function () {
            triggerLoad()
            window.clock.tick(1)
            assert.equal(fakeDom.lastXhr.timeout, 10000)
          })
        })
      })
    })
  })
}
