/* global window */
'use strict'
var tracker = window.barometer = module.exports = {}


var transport = require('./transport.js')
var pageChange = require('./pageChange.js')
var measures = require('./measures.js')
require('./pageLoadStats.js')
require('./xhrStats.js')
require('./pageResources')

tracker.url = null
tracker.offset = measures.offset
tracker.gauge = transport.gauge
tracker.count = transport.count
tracker.onPageChanged = pageChange.onPageChanged
tracker.oncePageLoaded = pageChange.oncePageLoaded
