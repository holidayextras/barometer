/* global window */
'use strict'
var tracker = window.barometer = module.exports = {}

var transport = require('./transport.js')
require('./pageLoadStats.js')
require('./xhrStats.js')
require('./pageChange')

tracker.url = null
tracker.gauge = transport.gauge
tracker.count = transport.count
