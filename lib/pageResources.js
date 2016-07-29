/* global window */
'use strict'
var pageResources = module.exports = {}

var pageChange = require('./pageChange.js')
var transport = require('./transport.js')
var lastIndex
var timingOffset = 0
var pageStart = new Date()

pageChange.onPageChange(function () {
  timingOffset = (new Date() - pageStart)
  var entries = window.performance.getEntries()
  for (; lastIndex++; lastIndex < entries.length) {
    pageResources.handleResource(entries[lastIndex])
  }
})

pageResources.handleResource = function (entry) {
  var metrics = pageResources.findRule(entry)
  if (!metrics) return
  pageResources.track(entry, metrics)
}

pageResources.findRule = function (entry) {
  var config = window.barometer.resources
  if (!config) return

  var name = entry.name.replace(/https?:\/\//i, '').split('/')
  var domain = name.shift()
  var path = name.join('/')

  for (var i = 0; i < config.length; i++) {
    var rule = config[i]
    if (rule.domain && !domain.match(rule.domain)) continue
    if (rule.resourceRegex && !path.match(rule.resourceRegex)) continue
    if (rule.type && entry.entryType !== rule.type) continue
    return rule.metrics
  }
  return null
}

pageResources.track = function (entry, metrics) {
  var prefix = entry.name.replace(/https?:\/\//i, '').split('?')[0].replace(/[a-z0-9_]/gi, '_')

  for (var i in metrics) {
    var value = entry[i]
    if (value === 0) continue
    if (i !== 'duration') value = timingOffset - value
    transport.gauge(prefix + '.' + i, value)
  }
}
