
async function build() {
    const packager = require("electron-packager");
    const appPaths = await packager({
        dir: ".",
        all: true,
        asar: true,
        out: "./dist/",
        ignore: [
            /(?:\.(ts|tsx|js\.map)$)/,
            /^(?!.*(package)).*(\.json).*/,
            ".vscode",
            "components",
            "src",
            "configs",
            ".gitignore",
            ".gitattributes",
            ".travis.yml",
            "react.js",
        ],
    });
}
build();
