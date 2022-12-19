const withTM = require('next-transpile-modules')(['@koale/useworker']);

module.exports = withTM({
    assetPrefix: ".",
    webpack: function (config, options) {
        config.experiments = { asyncWebAssembly: true };

        return config;
    },
});