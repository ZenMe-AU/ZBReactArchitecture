const fs = require("fs");
const path = require("path");

const mode = process.env.MIGRATION_LINK_MODE || "symlink";
const targetRoot = path.resolve(__dirname, "../src/module/shared/db/migration");
const moduleRoot = path.resolve(__dirname, "../src/module");
const excludeModuleList = ["shared", "swagger"];
const migrationSubPath = ["db", "migration"];

// Ensure the target directory exists
if (!fs.existsSync(targetRoot)) {
  fs.mkdirSync(targetRoot, { recursive: true });
  console.log(`Created migration root directory: ${targetRoot}`);
}

// Get all directories under the module root
const moduleDirs = fs.readdirSync(moduleRoot).filter((name) => {
  const fullPath = path.join(moduleRoot, name);
  return fs.statSync(fullPath).isDirectory();
});

moduleDirs.forEach((moduleName) => {
  if (excludeModuleList.includes(moduleName)) {
    console.log(`Skipped excluded module: ${moduleName}`);
    return;
  }

  const sourceDir = path.join(moduleRoot, moduleName, ...migrationSubPath);
  if (!fs.existsSync(sourceDir)) {
    console.warn(`Skipping: No migration folder found at ${sourceDir}`);
    return;
  }

  const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".js"));
  files.forEach((file) => {
    const source = path.join(sourceDir, file);
    const target = path.join(targetRoot, file);

    if (fs.existsSync(target)) {
      console.log(`Skipping existing file: ${target}(${moduleName})`);
      return;
    }

    if (mode === "symlink") {
      fs.symlinkSync(source, target);
      console.log(`Symlinked: ${target} → ${source}`);
    } else if (mode === "copy") {
      fs.copyFileSync(source, target);
      console.log(`Copied: ${source} → ${target}`);
    } else {
      console.error(`Invalid mode: '${mode}'. Use 'symlink' or 'copy'.`);
    }
  });
});
