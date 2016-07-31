/* global window */
'use strict'
var tracker = window.barometer = module.exports = {}

var transport = require('./transport.js')
var pageChange = require('./pageChange')
require('./pageLoadStats.js')
require('./xhrStats.js')
require('./pageResources')

tracker.url = null
tracker.gauge = transport.gauge
tracker.count = transport.count
tracker.onPageChange = pageChange.onPageChange
