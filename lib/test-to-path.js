'use strict'

const path = require('path')
const slugify = require('./lang/string/slugify')

module.exports = testToPath

const SNAPSHOT_DIR = path.resolve(process.cwd(), 'snapshots')

function testToPath(t, paths = []) {
  const parent = t.parent || t._parent
  const name = t.name || t._name
  const current = paths.length ? slugify(name) : `${slugify(name)}.snapshot`
  if (!parent) {
    paths.unshift(SNAPSHOT_DIR)
    return path.join.apply(path, paths)
  }

  paths.unshift(current)
  return testToPath(parent, paths)
}
