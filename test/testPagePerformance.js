/* global window */
'use strict'
var assert = require('assert')
require('./_fakeDom.js')
require('../lib/barometer.js')

describe('Testing barometer', function () {
  it('attaches to the window', function () {
    assert.ok(window.barometer)
    assert.ok(window.barometer.timing)
    assert.ok(window.barometer.count)
  })
})
