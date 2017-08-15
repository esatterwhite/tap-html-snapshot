'use strict'

const {Diff} = require('diff')
const mask = require('./mask')
const diff = new Diff()

module.exports = function isEqual(txt_1, txt_2) {
  const diffs = mask.reveal(diff.diff(txt_1, txt_2))
  return (diffs.length === 1 && !diffs[0].added && !diffs[0].removed)
}
