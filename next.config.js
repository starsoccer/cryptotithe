const isElectron = process.env.isElectron === 'true';

const assetPrefix = (isElectron ? 'https://next/' : '');

module.exports = {
    assetPrefix,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.node = {
                net: 'empty',
                fs: 'empty',
            };
        }

        return config;
    }
}