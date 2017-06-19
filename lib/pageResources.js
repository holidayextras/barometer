/* global window */
'use strict'
var pageResources = module.exports = {}

var pageChange = require('./pageChange.js')
var transport = require('./transport.js')
var lastIndex = 0

pageResources.handleResource = function (entry) {
  var rule = pageResources.findRule(entry)
  if (!rule) return
  pageResources.track(entry, rule)
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
    if (rule.path && !path.match(rule.path)) continue
    return rule
  }
  return null
}

pageResources.track = function (entry, rule) {
  var parts = entry.name.replace(/https?:\/\//i, '').split('/')
  var host = parts.shift()
  var path = (rule.rename || parts.join('/')).split('?')[0]

  for (var i in rule.metrics) {
    i = rule.metrics[i]
    var value = entry[i]
    if (value === 0) continue
    transport.timing('client_resource_event{host="' + host + '",path="' + path + '",lifeCycle="' + i + '"}', value)
  }
}

pageResources.initialise = function () {
  if (!window.performance || !window.performance.getEntries) return

  pageChange.onPageChanged(function () {
    var entries = window.performance.getEntries()
    if (!entries || !entries.length) return
    for (; lastIndex < entries.length; lastIndex++) {
      pageResources.handleResource(entries[lastIndex])
    }
  })
}
pageResources.initialise()
