'use strict'

const {Diff} = require('diff')

const MASK_REGEXP = /(.*){{(.+)}}(?!})(.*)/
const SPECIAL_CHAR_EXP = /([^A-Za-zА-Яа-я0-9_\-\s])/g
const diff = new Diff()

module.exports = {
  unmask
, concatNonDiffs
, reveal
, toDiff
}


function unmask(diffs) {
  if (!Array.isArray(diffs) || !diffs.length) return diffs
  for (var idx = 0; idx < diffs.length; idx++) {
    const current = diffs[idx]
    if (!_isDiff(current)) continue

    const previous_diff = diffs[idx - 1]
    const next_diff = diffs[idx + 1]
    const masked_part = current.value.match(MASK_REGEXP)

    if (!masked_part) continue

    // remove items whose value matched a mask
    const mask = new RegExp(
      '^'
    + masked_part[1].replace(SPECIAL_CHAR_EXP, '\\$1')
    + masked_part[2]
    + masked_part[3].replace(SPECIAL_CHAR_EXP, '\\$1')
    + '$'
    )
    if (current.removed && next_diff && next_diff.added) {
      if (mask.test(next_diff.value)) {
        next_diff.added = null
        diffs.splice(idx--, 1)
      }
      continue
    }

    if (current.added && previous_diff && previous_diff.removed) {
      if (mask.test(previous_diff.value)) {
        previous_diff.removed = null
        diffs.splice(idx--, 1)
      }
    }
  }
  return diffs
}

function concatNonDiffs(diffs) {
  if (!Array.isArray(diffs) || !diffs.length) return diffs
  for (var idx = 1; idx < diffs.length; idx++) {
    const current = diffs[idx]
    const prev = diffs[idx - 1]
    if (!_isDiff(current) && !_isDiff(prev)) {
      prev.value += current.value
      diffs.splice(idx--, 1)
    }
  }
  return diffs
}

function toDiff(txt_1, txt_2) {
  return unmask(diff.diff(txt_1, txt_2))
}

function reveal(diffs) {
  return concatNonDiffs(unmask(diffs))
}

function _isDiff(part) {
  return part && (part.added || part.removed)
}
