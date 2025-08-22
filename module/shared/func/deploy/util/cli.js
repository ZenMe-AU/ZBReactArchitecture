const { execSync } = require("child_process");

function npmInstall(cwd, options = "") {
  execSync(`npm install ${options}`, { stdio: "inherit", cwd });
}

function npmPrune(cwd) {
  execSync(`npm prune --production`, { stdio: "inherit", cwd });
}

function zipDir(targetZip, cwd, excludeList = []) {
  const excludeArgs = excludeList.map((p) => `-x "${p}"`).join(" ");
  execSync(`zip -r ${targetZip} . ${excludeArgs}`, { stdio: "inherit", cwd });
}

module.exports = { npmInstall, npmPrune, zipDir };
