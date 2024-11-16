import { watch } from "chokidar";
import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

function generateIndexFile(dir) {
  const files = readdirSync(dir).filter((file) => file.endsWith(".js"));
  let indexContent = "";

  files.forEach((file) => {
    if (file === "index.js") {
      return;
    }
    const moduleName = file.replace(".js", "");
    indexContent += `export * from './${moduleName}.js';\n`;
  });

  const indexPath = join(dir, "index.js");
  writeFileSync(indexPath, indexContent);
  // eslint-disable-next-line no-undef, no-console
  console.log(`Index file generated at ${indexPath}`);
}

// Watch the directories and regenerate index files on changes
function watchDirectories(dirs) {
  dirs.forEach((dir) => {
    watch(dir, { persistent: true, ignoreInitial: true }).on(
      "change",
      (filePath) => {
        // eslint-disable-next-line no-console, no-undef
        console.log(`Change detected in ${filePath}`);
        generateIndexFile(dir); // Regenerate index file when any file changes
      },
    );
  });
}

// Set directories to watch
const directoriesToWatch = ["./repository", "./utils", "./config"];
watchDirectories(directoriesToWatch);
