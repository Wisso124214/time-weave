const { addBabelPlugin, override } = require('customize-cra');

module.exports = override(
  addBabelPlugin([
    'module-resolver',
    {
      root: ['./src'],
      alias: {
        '@src': './src',
        '@components': './src/components',
        '@assets': './src/assets',
      },
    },
  ]),
  (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@src': require('path').resolve(__dirname, 'src'),
      '@components': require('path').resolve(__dirname, 'src/components'),
      '@assets': require('path').resolve(__dirname, 'src/assets'),
    };
    return config;
  }
);