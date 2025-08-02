const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable hot reloading
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize for development
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable source maps for better debugging
config.transformer.enableBabelRCLookup = false;

module.exports = config; 