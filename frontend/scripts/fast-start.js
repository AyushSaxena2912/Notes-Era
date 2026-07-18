/* Fast local dev — logs each step so we can see hangs */
console.log("[1] starting…");
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
process.env.DISABLE_ESLINT_PLUGIN = "true";
process.env.GENERATE_SOURCEMAP = "false";

console.log("[2] loading webpack…");
const webpack = require("webpack");
console.log("[3] loading webpack-dev-server…");
const WebpackDevServer = require("webpack-dev-server");
console.log("[4] loading CRA config…");
const paths = require("react-scripts/config/paths");
const configFactory = require("react-scripts/config/webpack.config");
const createDevServerConfig = require("react-scripts/config/webpackDevServer.config");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3001);

console.log("[5] building webpack config…");
const config = configFactory("development");
console.log("[6] creating compiler…");
const compiler = webpack(config);
const proxySetting = require(paths.appPackageJson).proxy;
const serverConfig = {
  ...createDevServerConfig(proxySetting, `http://${HOST}:${PORT}`),
  host: HOST,
  port: PORT,
  open: false,
};

console.log("[7] starting server…");
const server = new WebpackDevServer(serverConfig, compiler);
server.startCallback(() => {
  console.log(`\n✅ Open: http://${HOST}:${PORT}\n`);
});
