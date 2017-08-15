'use strict'

const tap = require('tap')
const mask = require('../lib/mask')
const test = tap.test

test('masking', (t) => {
  t.test('toDiff', (tt) => {
    tt.test('no mask', (ttt) => {
      const diffs = mask.toDiff('hello world', 'Hello World')
      tt.match(diffs, [
        { count: 1, added: undefined, removed: true, value: 'h' }
      , { count: 1, added: true, removed: undefined, value: 'H' }
      , { count: 5, value: 'ello ' }
      , { count: 1, added: undefined, removed: true, value: 'w' }
      , { count: 1, added: true, removed: undefined, value: 'W' }
      , { count: 4, value: 'orld' }
      ], 'generated diff array')
      ttt.end()
    })

    tt.test('mask text 1', (ttt) => {
      const diffs = mask.toDiff('hello {{[a-zA-Z]+}}', 'Hello World')
      ttt.match(diffs, [
        { count: 1, added: undefined, removed: true, value: 'h' }
      , { count: 1, added: true, removed: undefined, value: 'H' }
      , { count: 5, value: 'ello ' }
      ], 'generated diff array')
      ttt.end()
    })

    tt.test('mask text 2', (ttt) => {
      const diffs = mask.toDiff('hello world', 'Hello {{[a-zA-Z]+}}')
      ttt.match(diffs, [
        { count: 1, added: null, removed: true, value: 'h' }
      , { count: 1, added: true, removed: null, value: 'H' }
      , { count: 5, value: 'ello ' }
      , { count: 5, value: 'world' }
      ], 'generated diff array')
      ttt.end()
    })
    tt.end()
  })
  t.test('reveal', (tt) => {
    tt.end()
  })
  t.end()
})
