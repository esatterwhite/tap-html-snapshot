'use strict'
const fs = require('fs')
const snapshots = require('../../')
const testToPath = require('../../lib/test-to-path')
const tap = snapshots(require('tap'))
const test = tap.test


test('tap asserts', (t) => {
  t.test('diffEqual', (tt) => {
    tt.test('no masks', (ttt) => {
      const txt = 'a'.repeat(200)
      ttt.diffEqual(txt, txt)
      ttt.diffEqual('<div></div>', '<div></div>')
      ttt.diffEqual('<div></div>', '<div></div>')
      ttt.diffNotEqual('<div></div>', '<div>1</div>')
      ttt.end()
    })
    tt.test('w/ masks', (ttt) => {
      ttt.diffEqual('<div></div>', '<div></div>')
      ttt.diffEqual('<div>{{\\d+}}</div>', '<div>1</div>')
      ttt.diffNotEqual('<div>{{\\d+}}</div>', '<div>A</div>')
      ttt.end()
    })
    tt.end()
  })

  t.end()
})

test('generates snapshots', (t) => {
  const content = '<test>foo<test/>'
  const file_path = testToPath(t)

  t.on('end', () => {
    process.env.UPDATE_SNAPSHOTS = ''
  })

  process.env.UPDATE_SNAPSHOTS = 1
  t.snapshotEqual(content)
  process.env.UPDATE_SNAPSHOTS = ''

  const snapshot = fs.readFileSync(file_path, 'utf8')
  t.equal(content, snapshot, 'snapshot written')
  t.snapshotNotEqual('fake')
  t.end()
})

test('snapshots w/masking', (t) => {
  t.on('end', () => {
    process.env.UPDATE_SNAPSHOTS = ''
  })
  const content_1 = `
    Hello world this has a number 100.
    The number is dynamic and we can't
    know what it is ahead of time. Lets
    mask it.
  `
  const content_2 = `
    Hello world this has a number 200.
    The number is dynamic and we can't
    know what it is ahead of time. Lets
    mask it.
  `

  const content_3 = `
    Hello world this has a number one hundred.
    The number is dynamic and we can't
    know what it is ahead of time. Lets
    mask it.
  `
  t.snapshotMask(/\d{3}/)
  process.env.UPDATE_SNAPSHOTS = 1

  t.snapshotEqual(content_1)

  process.env.UPDATE_SNAPSHOTS = ''
  t.snapshotEqual(content_2)
  t.snapshotNotEqual(content_3)
  t.end()
})

