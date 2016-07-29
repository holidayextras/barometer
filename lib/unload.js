/* global window */
'use strict'
var unload = module.exports = {}

var event = require('event')
var transport = require('transport')
var pageChange = require('./pageChange.js')

unload.forSure = function () {
  pageChange._pageEnd()
  transport._flushBuffer(true)
}

unload.maybe = function () {
  transport._flushBuffer(false)
}

event(window, 'beforeunload', unload.forSure)
event(document, 'mouseout', function (e) {
  e = e || window.event
  e = e.relatedTarget || e.toElement
  if (!e || e.nodeName === 'HTML') {
    unload.maybe()
  }
})
event(document, 'keydown', function (e) {
  e = e || window.event || { }
  if (e.ctrlKey || e.metaKey) {
    unload.maybe()
  }
})
