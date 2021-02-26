const isElectron = process.env.isElectron === "true";

const assetPrefix = (isElectron ? "https://next/" : "");

const withTM = require('next-transpile-modules')(['@koale/useworker']);

module.exports = withTM({
    assetPrefix,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.node = {
                net: "empty",
                fs: "empty",
                tls: 'empty',
            };
        }

        return config;
    },
});