// @ts-check

const svgo = require('svgo')

const currentColor = process.env.CURRENT_COLOR || true

// Brand/logo icons keep their own fixed colors instead of tracking `color`.
// Everything else in this pack is a tintable outline icon.
const BRAND_ICONS = new Set([
  'aistudio',
  'anthropic',
  'azure-color',
  'bing-color',
  'brave-color',
  'claude-color',
  'claude-mono',
  'claudecode-color',
  'colab-color',
  'copilot-color',
  'cursor',
  'deepmind-color',
  'gemini-color',
  'github-color',
  'githubcopilot',
  'grok',
  'hermesagent',
  'krea',
  'ollama',
  'openai',
  'perplexity-color',
  'vercel',
  'windsurf',
  'xai',
])

// No currentColor forcing, no id-stripping: brand icons rely on their own
// fills/gradients, and blindly stripping ids breaks gradient url() refs.
const brandSvgoOptions = {
  multipass: true,
  plugins: ['preset-default', 'removeDimensions'],
}

const svgoOptions = {
  multipass: true,
  plugins: [
    'cleanupAttrs',
    'inlineStyles',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeXMLNS',
    'removeScriptElement',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    // 'removeViewBox',
    'cleanupEnableBackground',
    'minifyStyles',
    'convertStyleToAttrs',
    {name: 'convertColors', params: {currentColor}},
    'convertPathData',
    'convertTransform',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnusedNS',
    'cleanupIds',
    'cleanupNumericValues',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'mergePaths',
    // 'convertShapeToPath',
    'convertEllipseToCircle',
    'sortDefsChildren',
    'removeStyleElement',
    'removeDimensions',
    {name: 'addAttributesToSVGElement', params: {attributes: [{fill: 'currentColor'}]}},
    {name: 'removeAttrs', params: {attrs: ['id', 'class', '*:(stroke|fill):((?!^none$)(?!^currentColor$).)*']}},
    'sortAttrs',
  ],
}

/**
 * Optimize SVG with svgo
 * @param {string} source icon source
 * @param {string} [name] icon name, used to look up brand-icon exceptions
 */
function optimize(source, name) {
  const options = name && BRAND_ICONS.has(name) ? brandSvgoOptions : svgoOptions
  // @ts-expect-error - fix until @types/svgo updates to 2.0
  return svgo.optimize(source, options)
}

module.exports = {optimize}
