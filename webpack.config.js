const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    library: "redux-transitions",
    libraryTarget: "umd",
  },
  optimization: {
    runtimeChunk: true,
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "react",
    },
    reactRedux: {
      commonjs: "react-redux",
      commonjs2: "react-redux",
      amd: "react-redux",
      root: "react-redux",
    },
  },
};
