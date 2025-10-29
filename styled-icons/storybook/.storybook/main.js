export default {
  framework: '@storybook/react-vite',
  addons: [
    {
      name: 'storybook-addon-turbo-build',
      options: {
        optimizationLevel: 3,
      },
    },
  ],
  stories: ['../stories/**/*.stories.{js,jsx}'],

  async viteFinal(config) {
    config.esbuild = {
      ...config.esbuild,
      loader: 'jsx',
      include: /\.(js|jsx|ts|tsx)$/,
    }
    return config
  },
}
