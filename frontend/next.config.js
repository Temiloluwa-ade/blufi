const removeImports = require("next-remove-imports")();

/** @type {import('next').NextConfig} */
const nextConfig = removeImports({
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.cdc/,
      use: "raw-loader",
    });
    return config;
  },
});

module.exports = nextConfig;
