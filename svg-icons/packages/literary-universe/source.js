const glob = require('tiny-glob')
const fs = require('fs')
const path = require('path')

module.exports = async () => {
  const sourceFiles = await glob('source/*.svg', {absolute: true})

  return sourceFiles.map((filename) => {
    const match = filename.match(/([^/]+)\.svg$/)
    return {
      originalName: match[1],
      source: fs.readFileSync(filename).toString(),
      pack: 'literary-universe',
      width: '24',
      height: '24',
    }
  })
}
