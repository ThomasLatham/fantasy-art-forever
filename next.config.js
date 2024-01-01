const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

/** @type {import('next').NextConfig} */
module.exports = (phase, { defaultConfig }) => ({
  ...defaultConfig,
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // so that re2 gets prebuilt correctly
    // see https://github.com/uhop/node-re2/issues/63#issuecomment-815866708
    config.module.rules.push({
      test: /re2\.node$/i,
      use: "raw-loader",
    });

    // so that bufferutil and utf-8-validate work
    // see https://github.com/vercel/next.js/issues/44273#issuecomment-1374989371
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    return config;
  },
});
