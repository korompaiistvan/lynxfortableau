const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: this is only needed for development, to serve the superstore dataset
    // in production the user would need to upload their own workbook
    config.module.rules.push({
      test: /\.twb$/i,
      use: "raw-loader",
    });
    return config;
  },
});
