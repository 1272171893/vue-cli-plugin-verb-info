const { join } = require("path");
const { writeFileSync } = require("fs");
const cwd = process.cwd();
function getGitInfo() {
  const execSync = require("child_process").execSync;
  const commitId = execSync("git show -s --format=%H").toString().trim();
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  const usename = execSync("git show -s --format=%cn").toString().trim();
  const useemail = execSync("git show -s --format=%ce").toString().trim();
  const date = new Date(execSync("git show -s --format=%cd").toString());
  const message = execSync("git show -s --format=%s").toString().trim();
  return { commitId, branch, usename, useemail, date, message };
}
module.exports = (api, options) => {
  const gitInfo = getGitInfo();
  const { publicPath, outputDir, assetsDir } = options || {};
  const rootDir = join(publicPath, outputDir, assetsDir, "version.json");
  api.chainWebpack((webpackConfig) => {
    webpackConfig.when(process.env.NODE_ENV === "production", (config) => {
      config.plugin("define").tap((args) => {
        args[0]["process.env"].VERSION = JSON.stringify(gitInfo.commitId);
        return args;
      });
    });
  });
  api.configureWebpack((webpackConfig) => {
    if (process.env.NODE_ENV === "production") {
      webpackConfig.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap("create-version", () => {
            const content = JSON.stringify(gitInfo, null, 2);
            writeFileSync(join(cwd, rootDir), content);
          });
        },
      });
    }
  });
};
