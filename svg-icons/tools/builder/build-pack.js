#!/usr/bin/env node
// @ts-check

const fs = require('fs-extra')
const path = require('path')
const svgParser = require('svg-parser')
const svgo = require('./svgo')

const baseDir = process.cwd()

/**
 * @typedef {Object} SvgMetadata
 * @property {Object} attrs
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} Icon
 * @property {string} originalName
 * @property {string} source
 * @property {string} pack
 * @property {string} width
 * @property {string} height
 */

/**
 * @typedef {Object} ManifestItem
 * @property {string} name
 * @property {Object} attrs
 * @property {number} width
 * @property {number} height
 */

/**
 * @param {string} source
 * @returns {SvgMetadata}
 */
function svgMetadata(source) {
  const ast = svgParser.parse(source)
  const svgNode = ast.children.find((node) => node.type === 'element' && node.tagName === 'svg')
  
  if (!svgNode || svgNode.type !== 'element') {
    throw new Error('Invalid SVG: No root SVG element found')
  }
  
  const attrs = svgNode.properties || {}
  const viewBox = attrs['viewBox'] ? attrs['viewBox'].toString().split(' ') : ['0', '0', '24', '24']
  const [, , width, height] = viewBox
  return {attrs, width: parseInt(width), height: parseInt(height)}
}

/**
 * @param {Icon} a
 * @param {Icon} b
 * @returns {number}
 */
const sortIcons = (a, b) => a.originalName.localeCompare(b.originalName)

const generate = async () => {
  /** @type {Icon[]} */
  const icons = await require(path.join(baseDir, 'source.js'))()

  if (icons.length === 0) {
    console.log('Error reading icons from pack')
    process.exit(1)
  }

  icons.sort(sortIcons)

  const seenIcons = new Set()
  const uniqueIcons = icons.filter((/** @type {Icon} */ icon) => {
    if (seenIcons.has(icon.originalName)) {
      console.log(`Warning: ignoring duplicate icon ${icon.originalName}`)
      return false
    }
    seenIcons.add(icon.originalName)
    return true
  })

  const totalIcons = uniqueIcons.length
  /** @type {ManifestItem[]} */
  const manifest = []

  const iconFiles = uniqueIcons.map(async (/** @type {Icon} */ icon) => {
    try {
      const {data} = await svgo.optimize(icon.source, {multipass: true})
      await fs.writeFile(`${icon.originalName}.svg`, data)
      const metadata = svgMetadata(data)
      manifest.push({name: icon.originalName, ...metadata})
      await fs.writeJSON(`${icon.originalName}.json`, {name: icon.originalName, ...metadata})
    } catch (e) {
      console.log(icon.originalName)
      console.error(e)
      throw new Error(String(e))
    }
  })

  await Promise.all(iconFiles)

  await fs.writeFile(
    'icons.stories.js',
    `
import React from 'react';

// Static imports for all SVG files
${icons
  .map((/** @type {Icon} */ icon) => `import ${icon.originalName.replace(/[-]/g, '_')}Svg from './${icon.originalName}.svg?raw';`)
  .join('\n')}

const IconsGrid = () => {
  const iconData = [
${icons
  .map((/** @type {Icon} */ icon) => `    {
      name: '${icon.originalName}',
      svg: ${icon.originalName.replace(/[-]/g, '_')}Svg
    },`)
  .join('\n')}
  ];

  return React.createElement('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      padding: '20px'
    }
  }, iconData.map((icon, index) =>
    React.createElement('div', {
      key: index,
      style: {
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: '#f9f9f9'
      }
    }, [
      React.createElement('div', {
        key: 'name',
        style: {
          fontSize: '12px',
          marginBottom: '10px',
          fontWeight: 'bold',
          color: '#333'
        }
      }, icon.name),
      React.createElement('div', {
        key: 'icon',
        dangerouslySetInnerHTML: {
          __html: icon.svg
            .replace(/fill="[^"]*"/g, 'fill="red"')
            .replace(/stroke="[^"]*"/g, 'stroke="red"')
            .replace(/fill="currentColor"/g, 'fill="red"')
            .replace(/stroke="currentColor"/g, 'stroke="red"')
        },
        style: {
          width: '48px',
          height: '48px',
          margin: '0 auto'
        }
      })
    ])
  ));
};

export default {
  title: '${path.basename(baseDir)}',
  component: IconsGrid,
};

export const icons = {
  render: () => React.createElement(IconsGrid),
  parameters: {
    docs: {
      page: () => React.createElement(IconsGrid)
    }
  }
};
`.trim(),
  )

  await fs.writeJSON('__manifest.json', manifest)

  console.log(`${totalIcons} icons successfully built!`)
}

generate().catch((err) => {
  console.log(err.stack)
  process.exit(1)
})
