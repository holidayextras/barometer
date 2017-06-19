/* global window */
'use strict'
var assert = require('assert')
require('./_fakeDom.js')
var urlSanitiser = require('../lib/urlSanitiser.js')

describe('Testing urlSanitiser', function () {
  it('works with garbage', function () {
    var result = urlSanitiser()
    assert.deepEqual(result, [ '', '' ])
  })

  it('strips query params', function () {
    var href = 'http://www.example.com/foo?test=1'
    var hash = '#something'
    var result = urlSanitiser(href, hash)
    assert.deepEqual(result, [ 'www.example.com', 'foo' ])
  })

  it('joins paths in the hash', function () {
    var href = 'http://www.example.com/foo?test=1'
    var hash = '#/bar.bar?something'
    var result = urlSanitiser(href, hash)
    assert.deepEqual(result, [ 'www.example.com', 'foo/bar.bar' ])
  })

  it('mangles codes', function () {
    var href = 'http://10481.maindomain.com:5000/?agent=WEB1#/hotel/HPMANALR/upgrades?agent=WEB1'
    var hash = '#/hotel/HPMANALR/upgrades?agent=WEB1'
    var result = urlSanitiser(href, hash)
    assert.deepEqual(result, [ 'CODE.maindomain.com:5000', 'hotel/CODE/upgrades' ])
  })
})
