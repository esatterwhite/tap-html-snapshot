'use strict'

const tap = require('tap')
const isEqual = require('../lib/is-equal')
const test = tap.test

test('is-equal', (t) => {
  t.test('without mask', (tt) => {
    tt.ok(isEqual('hello world', 'hello world'))
    tt.notOk(isEqual('hello world!', 'hello world'))
    tt.end()
  })
  t.test('with mask', (tt) => {
    const text = '<div class="{{[a-z]+}}">text</div>'
    const cases = [{
      value: '<div class="red">text</div>'
    , expected: true
    }, {
      value: '<div class="blue">text</div>'
    , expected: true
    }, {
      value: '<div class="1">text</div>'
    , expected: false
    }, {
      value: '<div class="green">test</div>'
    , expected: false
    }]

    for (var idx = 0; idx < cases.length; idx++) {
      const current = cases[idx]
      tt.equal(
        isEqual(text, current.value)
      , current.expected
      , `${text} == ${current.value} - ${current.expected}`
      )
    }

    tt.end()
  })
  t.end()
})
