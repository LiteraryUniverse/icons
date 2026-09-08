const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {test} = require('node:test')
const {parse} = require('svg-parser')
const {optimize} = require('./svgo')

test('explicit paint survives beneath fill="none", while outline interiors stay unfilled', () => {
  const {data} = optimize('<svg viewBox="0 0 32 32" fill="none"><path fill="#a12577" d="M0 0h10v10H0z"/><path stroke="#a12577" d="M20 0v10"/></svg>')
  const root = parse(data).children[0]
  const paths = root.children
  assert.equal(root.properties.fill, 'none')
  assert.ok(paths.some(node => node.properties.fill === 'currentColor'))
  assert.ok(paths.some(node => node.properties.stroke === 'currentColor' && !node.properties.fill))
})

test('every optimized icon has a path with visible paint', () => {
  const source = path.resolve(__dirname, '../../packages/literary-universe/source')
  function hasPaint(node, fill = 'black', stroke = 'none') {
    const attrs = node.properties || {}
    fill = attrs.fill ?? fill
    stroke = attrs.stroke ?? stroke
    if (node.tagName === 'path' && attrs.d && (fill !== 'none' || stroke !== 'none')) return true
    return (node.children || []).some(child => hasPaint(child, fill, stroke))
  }
  for (const filename of fs.readdirSync(source).filter(name => name.endsWith('.svg'))) {
    const {data} = optimize(fs.readFileSync(path.join(source, filename), 'utf8'))
    assert.ok(hasPaint(parse(data)), `${filename} has no painted paths`)
  }
})
