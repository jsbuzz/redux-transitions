const path = require("path");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    library: "reduxTransitions",
    libraryTarget: "umd",
  },
  externals: ["react", "react-redux"],
};
