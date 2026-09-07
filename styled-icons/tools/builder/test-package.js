const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const {test} = require('node:test')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const {transformFileSync} = require('@babel/core')

const workspace = path.resolve(__dirname, '../..')
const packageDir = path.join(workspace, 'packages/styled-icons')
const icons = require(packageDir)
const manifest = require(path.join(packageDir, 'manifest.json'))
const render = (Icon, props) => renderToStaticMarkup(React.createElement(Icon, props))

test('all generated entry points render and keep the StyledIcon accessibility API', () => {
  assert.equal(manifest.length, 366)
  for (const {name, importPath, originalName} of manifest) {
    assert.equal(importPath, `@literary-universe/styled-icons/${name}`)
    assert.ok(originalName)
    assert.equal(require(path.join(packageDir, name))[name], icons[name])
    assert.match(render(icons[name], {size: 24}), /aria-hidden="true"/)
    const named = render(icons[name], {size: 32, title: name, color: 'rebeccapurple'})
    assert.match(named, /role="img"/)
    assert.ok(named.includes(`<title>${name}</title>`))
    assert.match(named, /color="rebeccapurple"/)
    assert.match(named, /height="32"/)
  }
})

test('redesigned outlines and non-square Settings preserve their source geometry', () => {
  assert.match(render(icons.Cancel), /fill="none" stroke="currentColor"[^>]*stroke-width="2"/)
  assert.match(render(icons.Diary), /fill="none" stroke="currentColor"[^>]*stroke-width="1.26"/)
  assert.match(render(icons.AccountSettings), /fill-rule="evenodd"/)
  assert.match(render(icons.Settings, {size: 32}), /viewBox="0 0 33 32" height="32" width="32"/)
  for (const name of ['AudioBooks', 'Bookmark', 'Diary', 'MangaComics']) assert.ok(icons[name])
})

test('generator resolves the consumer SVG pack and preserves root strokes and viewBox origins', () => {
  const temporary = fs.mkdtempSync(path.join(packageDir, '.test-icons-'))
  try {
    const source = path.join(temporary, 'node_modules/test-svg-pack')
    fs.mkdirSync(source, {recursive: true})
    fs.writeFileSync(path.join(temporary, 'package.json'), JSON.stringify({name: 'test-styled-pack'}))
    fs.writeFileSync(
      path.join(source, '__manifest.json'),
      JSON.stringify([
        {
          name: 'outline',
          width: 32,
          height: 24,
          attrs: {viewBox: '-2 -3 32 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2'},
        },
      ]),
    )
    fs.writeFileSync(
      path.join(source, 'outline.svg'),
      '<svg viewBox="-2 -3 32 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0L20 20"/></svg>',
    )
    execFileSync(path.join(packageDir, 'node_modules/.bin/generate-icon-package'), ['test-svg-pack'], {cwd: temporary})
    const filename = path.join(temporary, 'Outline/Outline.tsx')
    const {code} = transformFileSync(filename, {configFile: path.join(workspace, 'babel.config.js'), envName: 'legacy'})
    const compiled = filename.replace('.tsx', '.js')
    fs.writeFileSync(compiled, code)
    const {Outline} = require(compiled)
    assert.match(render(Outline), /viewBox="-2 -3 32 24"/)
    assert.match(render(Outline), /fill="none"[^>]*stroke="currentColor" stroke-width="2"/)
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true})
  }
})
