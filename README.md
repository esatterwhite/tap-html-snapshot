## Tap snapshot diff

The tap diff assertion allow you to compare textual content comparing diffs to help
generate detailed output. It also supports comparison masking for comparing dynamically
generated strings as well as generating static snapshots of content

## Api

### t.snapshotMask(mask<String|Regex>)

Adds a mask expression insert into the test snapshot before saving. The expression
will insert itself into the snapshot where the expression matches

```javascript
t.diffMask(/foo-(\d+)/)

// this is foo-1
// this is {{foo-(\d+)}}

```

## Asserts

### t.diffEqual(found, wanted, [message])

Asserts the two strings are the same.
Similar to the `equal` assert, but will allow for expression masking,
and will display a diff of the content when a match is not found.

* **found** [`<String>`] The content that was found as a result of the test
* **wanted** [`<String>`] The content that was expected to be found
* **message** [`<String>`] A message to display for the test.

### t.diffNotEqual

Asserts that two strings are not the same.
Similar to the `notEqual` assert, but will allow for expression masking.

* **found** [`<String>`] The content that was found as a result of the test
* **wanted** [`<String>`] The content that was expected to be found
* **message** [`<String>`] A message to display for the test.

### t.snapshotEqual(wanted, [message])

Compares the provided content to a saved snapshot, and asserts they are equal. If the
environment variable - `UPDATE_SNAPSHOTS` is set, The passed in content will be used
to create a new version of the snap shot

* **wanted** [`<String>`] The content that was expected to be found

### t.snapshotNotEqual(unwanted, [message])

Compares the provided content to a saved snapshot, and asserts they not equal. If the
environment variable - `UPDATE_SNAPSHOTS` is set, the passed in content will be used
to create a new version of the snap shot

* **unwanted** [`<String>`] The content that was expected to be found


### Standard diff comparisons

```javascript
const snapshots = require('@helpdotcom/tap-snapshot-diff')
const tap = snapshots(require('tap'))
const test = tap.test

test('plain diffs', (t) => {
  t.diffEqual('<div></div>', '<div></div>')
  t.diffNotEqual('<div></div>', '<div>1</div>')
})

```
#### Diff Mask comparisons

Diff Masking allows for limited regular expression matching when comparing string diffs.
This can be useful for templated content where you may not know exactly what is being generated
but know a basic pattern

```javascript

const snapshots = require('@helpdotcom/tap-snapshot-diff')
const tap = snapshots(require('tap'))
const test = tap.test

test('Mask diffs', (t) => {
  t.diffEqual('<div></div>', '<div></div>') // matches
  t.diffEqual('<div>{{\\d+}}</div>', '<div>1</div>') // matches
  t.diffEqual('<div>{{\\d+}}</div>', '<div>FOO</div>') // fails
})
```

### Snapshot Diffs

Using the `snapshotEqual` and `snapshotNotEqual` assertions, you can generate,
and compare against content snapshots similar to the `diffEqual` and `diffNotEqual`
assertions. Setting the environment varialbe `UPDATE_SNAPSHOTS` will trigger any test using
either of the snapshot assertions to generate a new file with the content passed before doing
a comparison.

```javascript
const snapshots = require('@helpdotcom/tap-snapshot-diff')
const tap = snapshots(require('tap'))
const fs = require('fs')
const handlebars = require('handlebars')
const test = tap.test

test('simple snapshots', (t) => {
  const tpl = fs.readFileSync('somefile.hbs')
  const template = handlebars.compile(tpl)
  const out = template.render({ ... })
  t.snapshotEqual(out)
})
```

#### Snapshot Masking

If you are going to be comparing snapshots against dynamic content, such as
templates with dates, or generated numbers, you can use the `snapshotMask`
test function to inject a mask into the snapshot before writing it.
The mask is a regular expression which will be used to insert itself into the
snapshot

```javascript
const snapshots = require('@helpdotcom/tap-snapshot-diff')
const tap = snapshots(require('tap'))
const handlebars = require('handlebars')
const test = tap.test

test('simple snapshots', (t) => {
  const content = `
  <div id="fake-id-{{test_id}}">test</div>
  `
  const template = handlebar.compile(content)
  const out = template({
    test_id: Date.now()
  })
  t.snapshotMask(/fake-id-(\d+)/)
  t.snapshotEqual(out)
})

```

In the above example, when the enviroment variable `UPDATE_SNAPSHOTS` is set,
will generate the snapshot with a mask in the place that matches the provided expression

```
<div id="{{fake-id-(\\d+)}}">test</div>
```

On further test runs, the snapshot will continue to pass as long as the provided
content passes the mask

```javascript

t.snapshotEqual('<div id="fake-id-1">test</div>') // passes
t.snapshotEqual('<div id="fake-id-1502923359821">test</div>') // passes
t.snapshotEqual('<div id="fake-id-hello">test</div>') // fails
```

**NOTE**: Snap shot files are generate based on test heirarchy.
Duplicate test names will over ride snapshots

```javascript
test('test a', (t) => {
  t.test('test b', (tt) => {
    tt.test('test c', (ttt) => {
      ttt.snapshotEqual('hello world')
      // generates /test-a/-test-b/test-c.snapshot
    })
  })
})

test('test a', (t) => {
  t.test('test b', (tt) => {
    tt.test('test c', (ttt) => {
      ttt.snapshotEqual('goodby world')
      // overrides /test-a/-test-b/test-c.snapshot
    })
  })
})
```
