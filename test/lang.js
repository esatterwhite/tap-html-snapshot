'use strict'

const tap = require('tap')
const lang = require('../lib/lang')

const test = tap.test

test('lang', (t) => {
  t.test('exports', (tt) => {
    const modules = Object.keys(lang).sort()
    tt.deepEqual(modules, ['object', 'string'].sort(), 'exported modules')
    tt.end()
  })
  t.test('string.slugify', (tt) => {
    const slugify = lang.string.slugify

    const cases = [{
      value: 'Hello World!'
    , expected: 'hello-world'
    }, {
      value: 'HEllo: - - - WORLD!!'
    , expected: 'hello-world'
    }, {
      value: 'HELLO   - 1 - 2 - WoRld   !'
    , expected: 'hello-1-2-world'
    }, {
      value: ''
    , expected: ''
    , message: '\'\' == \'\''
    }]

    tt.type(slugify, 'function', 'slugify is a function')
    for (var idx = 0; idx < cases.length; idx++) {
      const current = cases[idx]
      tt.equal(
        slugify(current.value)
      , current.expected
      , current.message || `slugify(${current.value}) == ${current.expected}`
      )
    }
    tt.end()
  })
  t.test('object.isRegex', (tt) => {
    const isRegex = lang.object.isRegex
    tt.type(isRegex, 'function')
    tt.ok(isRegex(/\s/), 'regex literal')
    tt.ok(isRegex(new RegExp('\\w+')), 'regex constructor')
    tt.notOk(isRegex('/\s/'), 'string')
    tt.notOk(isRegex(true), 'boolean')
    tt.notOk(isRegex({}), 'object')
    tt.end()
  })
  t.end()
})
