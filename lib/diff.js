'use strict'

const {EOL} = require('os')
const {Diff} = require('diff')
const ansi = require('ansi-styles')
const mask = require('./mask')
const _diff = new Diff()
const bold = ansi.bold

module.exports = {
  addition
, diffToText
, createDiff
, negation
, neutral
, pprint
, textToDiff
}

function createDiff(text_1, text_2) {
  return mask.reveal(mask.toDiff(text_1, text_2))
}

function diffToText(diffs) {
  if (!Array.isArray(diffs) || !diffs.length) return ''
  if (diffs.length === 1 && !diffs[0].aded && !diffs[0].removed) {
    return neutral(diffs[0].value)
  }
  let output = ''

  for (var idx = 0; idx < diffs.length; idx++) {
    const diff = diffs[idx]
    const value = diff.value
    let color = null

    if (diff.added) color = addition
    if (diff.removed) color = negation

    if (color) {
      output += (idx ? '' : EOL) + color(value)
      continue
    }

    if (diff.count > 80) {
      output += (idx ? '' : EOL) + neutral(value.substr(0, 40))
      continue
    }

    output += neutral(value.substr(0, 40))
    if (idx < diff.length - 1) {
      output += `${EOL}...${EOL}` + neutral(value.substr(diff.count - 40))
    }
  }
  return output
}

function textToDiff(text_1, text_2) {
  return _diff.diff(text_1, text_2)
}

function pprint(diffs) {
  process.stderr.write(diffToText(diffs))
  process.stderr.write(EOL)
}

function addition(text, color = 'bgGreen') {
  return _wrap(text, color)
}

function negation(text, color = 'bgRed') {
  return _wrap(text, color)
}

function neutral(text, color = 'grey') {
  return _wrap(text, color)
}

function _wrap(text, color) {
  const style = ansi[color] || bold
  return `${style.open}${text}${style.close}`
}
