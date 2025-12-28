const { execSync } = require("child_process");

let outdatedJson = "";
try {
  // Step 1: Get outdated packages in JSON
  outdatedJson = execSync("pnpm outdated -r --json", { encoding: "utf-8" });
} catch (err) {
  // If command fails, still try to read stdout
  if (err.stdout) {
    outdatedJson = err.stdout;
  } else if (err.output && err.output[1]) {
    outdatedJson = err.output[1];
  } else {
    console.error("Error running pnpm outdated:", err);
    process.exit(1);
  }
}

try {
  const outdatedData = JSON.parse(outdatedJson);

  // Step 2: Find packages where latest > current
  const packagesToUpdate = Object.entries(outdatedData)
    .filter(([pkg, info]) => info.current && info.latest && info.current !== info.latest)
    .map(([pkg]) => pkg);

  if (packagesToUpdate.length === 0) {
    console.log("✅ All packages are up-to-date.");
    process.exit(0);
  }

  console.log("Packages to update:", packagesToUpdate.join(", "));

  // Step 3: Update each package to latest
  packagesToUpdate.forEach((pkg) => {
    console.log(`Updating ${pkg} to latest...`);
    execSync(`pnpm -r update ${pkg} --latest`, { stdio: "inherit" });
  });

  console.log("\n✅ Updated packages:", packagesToUpdate.join(", "));
} catch (err) {
  console.error("Error parsing or updating:", err);
  process.exit(1);
}
