module.exports = {
  framework: '@storybook/html-webpack5',
  stories: ['../packages/**/*.stories.[tj]s'],

  webpackFinal: async (config) => {
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.type === 'asset/resource') {
        // Removing the rule for SVGs
        rule.test = /\.(ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
      }
      return rule
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: 'raw-loader',
    })

    return config
  },
}
