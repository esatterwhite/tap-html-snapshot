'use strict'

const kMask = Symbol('kMask')

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const diff = require('./diff')
const testToPath = require('./test-to-path')
const {isRegex} = require('./lang/object')

// TODO(esatterwhite) expose more asserts for json / css + html options
// TODO(esatterwhite) This is doing char - by - char diffing. word and line
// diffing is also supported and would be more accurate / faster in some cases
module.exports = function(tap) {
  const t = tap.Test.prototype

  t.snapshotMask = function(regex, replacer) {
    let matcher
    const mask = isRegex(regex)
      ? regex.source
      : regex

    if (!replacer) {
      matcher = mask
    } else {
      matcher = isRegex(replacer)
        ? replacer.source
        : replacer
    }

    this[kMask] = this[kMask] || new Map()
    this[kMask].set(new RegExp(matcher), `{{${mask}}}`)
    return true
  }

  t.addAssert('diffEqual', 2, function(expect, found, m, extra) {
    const diffs = diff.createDiff(expect, found)
    if (diffs.length === 1 && !diffs[0].added && !diffs[0].removed) {
      return this.pass(m || 'diff matches')
    }
    extra.wanted = expect
    extra.found = found
    extra.compare = '==='
    this.comment('content diff', diff.diffToText(diffs))
    this.fail(m || 'diff does not matche', extra)
  })

  t.addAssert('diffNotEqual', 2, function(expect, found, m, extra) {
    const diffs = diff.createDiff(expect, found)
    if (diffs.length === 1 && !diffs[0].added && !diffs[0].removed) {
      extra.wanted = expect
      extra.found = found
      extra.compare = '!=='
      this.comment('content diff', diff.diffToText(diffs))
      return this.fail(m || 'content should not match')
    }
    extra.found = 'test'
    this.pass(m || 'diff does not match', extra)
  })

  t.addAssert('snapshotEqual', 1, function(found, m, extra) {
    const UPDATE = process.env.UPDATE_SNAPSHOTS
    const filepath = testToPath(this)
    let expected = null

    if (UPDATE) {
      mkdirp.sync(path.dirname(filepath))
      let snapshot = found
      if (this[kMask] && this[kMask].size) {
        for (var [key, value] of this[kMask].entries()) {
          snapshot = snapshot.replace(key, value)
        }
      }
      fs.writeFileSync(filepath, snapshot)
    }
    try {
      expected = fs.readFileSync(filepath, 'utf8')
    } catch (e) {
      this.comment(e.message)
      return this.fail(m || 'unable to load snap shot for ' + this.name)
    }
    if (!expected) {
      return this.fail(`snapshot not found: ${filepath}`)
    }
    const diffs = diff.createDiff(expected, found)
    if (diffs.length === 1 && !diffs[0].added && !diffs[0].removed) {
      return this.pass(m || 'snapshot matches')
    }
    extra.wanted = expected
    extra.found = found
    extra.compare = '==='
    this.comment('content diff', diff.diffToText(diffs))
    this.fail(m || 'snapshot does not match', extra)
  })

  t.addAssert('snapshotNotEqual', 1, function(found, m, extra) {
    const filepath = testToPath(this)
    let expected = null

    try {
      expected = fs.readFileSync(filepath, 'utf8')
    } catch (e) {
      this.comment(e.message)
      return this.fail(m || 'unsable to load snap shot for ' + this.name)
    }
    if (!expected) {
      return this.fail(`snapshot not found: ${filepath}`)
    }
    const diffs = diff.createDiff(expected, found)
    if (diffs.length === 1 && !diffs[0].added && !diffs[0].removed) {
      extra.wanted = expected
      extra.found = found
      extra.compare = '!=='
      return this.fail(m || 'snapshot should not match', extra)
    }
    this.pass(m || 'snapshot does not match')
  })
  return tap
}
