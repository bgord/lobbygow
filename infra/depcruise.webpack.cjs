/* depcruise.webpack.cjs */
const path = require("node:path");

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "+infra": path.resolve(__dirname, "infra"),
      "+app": path.resolve(__dirname, "app"),
      "+languages": path.resolve(__dirname, "modules/languages.ts"),
      "+notifier": path.resolve(__dirname, "modules/notifier"),
    },
  },
};
