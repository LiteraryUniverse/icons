const fs = require('fs-extra')
const icons = require('@literary-universe/styled-icons/manifest.json')
const path = require('path')

async function run() {
  const packs = {}

  for (const icon of icons) {
    packs[icon.pack] = packs[icon.pack] || []
    packs[icon.pack].push(icon.name)
  }

  await fs.mkdirp(path.join(__dirname, 'stories'))

  for (const pack of Object.keys(packs)) {
    const packIcons = packs[pack].sort()
    const stories = `
import React from 'react'
import * as iconComponents from '@literary-universe/${pack}'

export default {
  title: '${pack}',
}

export const icons = () => (
  <>
${packIcons.map((icon) => `    <div><iconComponents.${icon} size="32" color="red" /> ${icon}</div>`).join('\n')}
  </>
)

    `
    await fs.writeFile(path.join(__dirname, 'stories', `${pack}.stories.jsx`), stories)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
