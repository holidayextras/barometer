'use strict'
module.exports = function (href, hash) {
  var safeUrl = (href || '').split('?')[0]
  safeUrl = safeUrl.replace(/^https?:\/\//i, '')
  if (safeUrl[0] === '/') {
    safeUrl = (window.location.host || '').replace(/[^a-z0-9-\/]/gi, '_') + '.' + safeUrl.slice(1).replace(/[^a-z0-9-\/]/gi, '_')
  } else {
    safeUrl = safeUrl.split('/')
    safeUrl = safeUrl.shift().replace(/[^a-z0-9-\/]/gi, '_') + '.' + safeUrl.join('/').replace(/[^a-z0-9-\/]/gi, '_')
  }
  if ((hash || '').match(/\?/)) {
    safeUrl += hash.split('?')[0].slice(1).replace(/[^a-z0-9-]/gi, '_')
  }
  return safeUrl // .replace(/\/\//g, '/')
}
