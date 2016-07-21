/* global */
'use strict'
module.exports = function (obj, evt, fn) {
  if (obj.addEventListener) {
    obj.addEventListener(evt, fn, false)
  } else if (obj.attachEvent) {
    obj.attachEvent('on' + evt, fn)
  }
}
