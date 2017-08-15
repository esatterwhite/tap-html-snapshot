'use strict'

module.exports = isRegex

function isRegex(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]'
}
