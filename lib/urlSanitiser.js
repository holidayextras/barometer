'use strict'
module.exports = function (href, hash) {
  var safeUrl = (href || '').split('?')[0]
  safeUrl = safeUrl.replace(/^https?:\/\//i, '')

  // Account for relative paths
  if (safeUrl[0] === '/') {
    safeUrl = (window.location.host || '') + safeUrl
  }

  // Trim trailing slash
  if (safeUrl[safeUrl.length - 1] === '/') safeUrl = safeUrl.slice(0, safeUrl.length - 1)

  // Append hash paths
  if ((hash || '').match(/\?/)) {
    hash = hash.split('?')[0].slice(1)
    if (hash[0] !== '/') safeUrl += '/'
    safeUrl += hash
  }

  // Replace IDs
  var urlParts = safeUrl.split(/[/.]/g)
  for (var i = 0; i < urlParts.length; i++) {
    if (urlParts[i].match(/^[A-Z0-9-]+$/)) safeUrl = safeUrl.replace(urlParts[i], 'CODE')
  }

  // Strip any quotes
  safeUrl = safeUrl.replace(/["']/gi, '')

  var path = safeUrl.split('/')
  var host = path.shift()
  path = path.join('/')
  return [ host, path ]
}
