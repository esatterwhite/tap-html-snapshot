'use strict'

const os = require('os')
const tap = require('tap')
const ansi = require('ansi-styles')
const diff = require('../lib/diff')
const test = tap.test

function style(text, color) {
  const style = ansi[color] || ansi.bold
  return `${style.open}${text}${style.close}`
}

test('diff', (t) => {
  t.test('exports', (tt) => {
    tt.type(diff.addition, 'function', 'diff.addition')
    tt.type(diff.pprint, 'function', 'diff.pprint')
    tt.type(diff.addition, 'function', 'diff.addition')
    tt.type(diff.negation, 'function', 'diff.negation')
    tt.type(diff.neutral, 'function', 'diff.neutral')
    tt.type(diff.textToDiff, 'function', 'diff.textToDiff')
    tt.type(diff.diffToText, 'function', 'diff.diffToText')
    tt.end()
  })

  t.test('addition', (tt) => {
    const cases = [{
      value: diff.addition('hello world')
    , expected: style('hello world', 'bgGreen')
    }, {
      value: diff.addition('hello world', 'blue')
    , expected: style('hello world', 'blue')
    }, {
      value: diff.addition('hello world', 'fakeColor')
    , expected: style('hello world', 'bold')
    , message: 'defaults to bold'
    }]

    testem(tt, cases)
    tt.end()

  })

  t.test('negation', (tt) => {
    const cases = [{
      value: diff.negation('hello world')
    , expected: style('hello world', 'bgRed')
    }, {
      value: diff.negation('hello world', 'fakeColor')
    , expected: style('hello world', 'bold')
    , message: 'defaults to bold'
    }, {
      value: diff.negation('hello world', 'red')
    , expected: style('hello world', 'red')
    , message: 'accepts a color'
    }]
    testem(tt, cases)
    tt.end()
  })

  t.test('textToDiff', (tt) => {
    const diffs = diff.textToDiff('hello world', 'Hello World')
    tt.match(diffs, [
      { count: 1, added: undefined, removed: true, value: 'h' }
    , { count: 1, added: true, removed: undefined, value: 'H' }
    , { count: 5, value: 'ello ' }
    , { count: 1, added: undefined, removed: true, value: 'w' }
    , { count: 1, added: true, removed: undefined, value: 'W' }
    , { count: 4, value: 'orld' }
    ], 'generated diff array')
    tt.end()
  })
  t.test('diffToText', (tt) => {
    tt.test('text w/ diffs', (ttt) => {
      const diffs = diff.textToDiff('hello world', 'Hello World')
      const out = diff.diffToText(diffs)
      const expected = [
        os.EOL
      , diff.negation('h')
      , diff.addition('H')
      , diff.neutral('ello ')
      , diff.negation('w')
      , diff.addition('W')
      , diff.neutral('orld')
      ].join('')
      ttt.equal(out, expected, `${out} === ${expected}`)
      ttt.end()
    })
    tt.test('text w/o diffs', (ttt) => {
      ttt.equal(diff.diffToText(null), '', 'null diffs')
      const single = diff.diffToText([{value: 'empty'}])
      ttt.equal(single, diff.neutral('empty'), 'no diffs')
      ttt.end()
    })
    tt.test('long diffs truncated at 40', (ttt) => {
      const txt_1 = 'abc' + 'd'.repeat(100)
      const txt_2 = 'bbc' + 'd'.repeat(100)
      const diffs = diff.textToDiff(txt_1, txt_2)
      const out = diff.diffToText(diffs)
      const expected = [
        os.EOL
      , diff.negation('a')
      , diff.neutral('b')
      , diff.addition('b')
      , diff.neutral(`c${'d'.repeat(39)}`)
      ].join('')
      ttt.equal(out, expected, `${out} === ${expected}`)
      ttt.end()
    })
    tt.end()
  })
  t.end()
})

function testem(t, cases) {
  for (var idx = 0; idx < cases.length; idx++) {
    const current = cases[idx]
    t.equal(
     current.value
    , current.expected
    , current.message || `${current.value} == ${current.expected}`
    )
  }
}
