const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "../");
console.log(`[CleanUp] Scanning for broken symlinks in project root: ${rootDir}`);

function cleanBrokenSymlinks(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    try {
      const stat = fs.lstatSync(fullPath);

      if (stat.isSymbolicLink()) {
        const targetPath = fs.readlinkSync(fullPath);
        const resolvedPath = path.resolve(path.dirname(fullPath), targetPath);

        if (!fs.existsSync(resolvedPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Removed broken symlink: ${fullPath} → ${targetPath}`);
        }
      } else if (stat.isDirectory()) {
        cleanBrokenSymlinks(fullPath);
      }
    } catch (err) {
      console.warn(`Skipping: ${fullPath}`, err.message);
    }
  });
}

cleanBrokenSymlinks(rootDir);
