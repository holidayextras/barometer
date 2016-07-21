'use strict'
module.exports = function (href, hash) {
  var safeUrl = (href || '').split('?')[0].replace(/^https?:\/\//i, '').replace(/[^a-z0-9-\/]/gi, '_')
  if ((hash || '').match(/\?/)) {
    safeUrl += hash.split('?')[0].slice(1).replace(/[^a-z0-9-\/]/gi, '_')
  }
  return safeUrl // .replace(/\/\//g, '/')
}
