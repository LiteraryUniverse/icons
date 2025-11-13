import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
export default {
  framework: '@storybook/react-vite',
  stories: ['../packages/**/*.stories.[tj]s'],

  viteFinal: async (config) => {
    // Configure Vite to handle raw-loader requires
    config.build.rollupOptions = {
      ...config.build.rollupOptions,
      external: [],
    }
    
    return config
  },
}

function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
