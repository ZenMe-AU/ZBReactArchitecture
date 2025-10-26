const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function npmInstall(cwd, options = "") {
  execSync(`npm install ${options}`, { stdio: "inherit", cwd });
}

function npmPrune(cwd) {
  execSync(`npm prune --production`, { stdio: "inherit", cwd });
}

function hasZipCli() {
  try {
    execSync("zip -v", { stdio: "ignore" });
    return true;
  } catch (_) {
    return false;
  }
}

function normalizeExcludes(excludeList = []) {
  return excludeList
    .filter(Boolean)
    .map((p) => p.replace(/^\"|\"$/g, ""))
    .map((p) => (p.endsWith("/*") ? p.replace("/*", "/**") : p));
}

function zipDir(targetZip, cwd, excludeList = []) {
  if (hasZipCli()) {
    const excludeArgs = excludeList.map((p) => `-x "${p}"`).join(" ");
    execSync(`zip -r ${targetZip} . ${excludeArgs}`.trim(), { stdio: "inherit", cwd });
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let archiver;
    try {
      archiver = require("archiver");
    } catch (e) {
      return reject(new Error("Missing dependency 'archiver'. Please run npm install before deployment."));
    }

    const outputPath = path.resolve(cwd, targetZip);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    output.on("error", (err) => reject(err));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    const ignores = normalizeExcludes([...excludeList, targetZip.replace(/\\/g, "/")]);

    archive.glob("**/*", {
      cwd,
      dot: true,
      ignore: ignores,
    });

    archive.finalize();
  });
}

module.exports = {
  npmInstall,
  npmPrune,
  zipDir,
};
