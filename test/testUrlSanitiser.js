/* global window */
'use strict'
var assert = require('assert')
require('./_fakeDom.js')
var urlSanitiser = require('../lib/urlSanitiser.js')

describe('Testing urlSanitiser', function () {
  it('works with garbage', function () {
    var result = urlSanitiser()
    assert.equal(result, '')
  })

  it('strips query params', function () {
    var href = 'http://www.example.com/foo?test=1'
    var hash = '#something'
    var result = urlSanitiser(href, hash)
    assert.equal(result, 'www_example_com/foo')
  })

  it('joins paths in the hash', function () {
    var href = 'http://www.example.com/foo?test=1'
    var hash = '#/bar.bar?something'
    var result = urlSanitiser(href, hash)
    assert.equal(result, 'www_example_com/foo/bar_bar')
  })
})
