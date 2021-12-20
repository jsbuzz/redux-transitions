export default [
  {
    input: "src/index.js",
    external: ["react", "react-redux"],
    output: {
      file: "redux-transitions.js",
      format: "cjs",
    },
  },
  {
    input: "src/hooks.js",
    external: ["react", "react-redux"],
    output: {
      file: "hooks.js",
      format: "cjs",
    },
  },
];
