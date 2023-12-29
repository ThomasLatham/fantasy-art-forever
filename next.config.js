const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

/** @type {import('next').NextConfig} */
module.exports = (phase, { defaultConfig }) => ({
  ...defaultConfig,
  reactStrictMode: true,
  webpack(config) {
    // so that re2 gets prebuilt correctly
    // see https://github.com/uhop/node-re2/issues/63#issuecomment-815866708
    config.module.rules.push({
      test: /re2\.node$/i,
      use: "raw-loader",
    });

    return config;
  },
});
