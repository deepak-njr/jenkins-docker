const path = require("path");
const { pathsToModuleNameMapper } = require("ts-jest");
const CracoLessPlugin = require("craco-less");
const { compilerOptions } = require("./tsconfig.paths.json");

module.exports = {
  rules: [
    {
      test: /\.scss$/,
      use: [
        {
          loader: "style-loader", // creates style nodes from JS strings
        },
        {
          loader: "css-loader", // translates CSS into CommonJS
        },
        {
          loader: "sass-loader", // compiles Sass to CSS
        },
      ],
    },
  ],
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#29256E",
              "@heading-color": "#29256E",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/Assets"),
      "@components": path.resolve(__dirname, "src/Components"),
      "@context": path.resolve(__dirname, "src/Context"),
      "@hooks": path.resolve(__dirname, "src/Hooks"),
      "@modules": path.resolve(__dirname, "src/Modules"),
      "@routes": path.resolve(__dirname, "src/Routes"),
      "@services": path.resolve(__dirname, "src/Services"),
      "@store": path.resolve(__dirname, "src/Store"),
      "@styles": path.resolve(__dirname, "src/Styles"),
      "@typedef": path.resolve(__dirname, "src/Types"),
      "@utils": path.resolve(__dirname, "src/Utils"),
    },
  },
  jest: {
    configure: {
      preset: "ts-jest",
      moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: "<rootDir>/src/",
      }),
    },
  },
};
