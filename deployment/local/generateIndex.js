import { watch } from 'chokidar';
import { readdirSync, writeFileSync } from 'fs';
import minimist from 'minimist'; // For command-line argument parsing
import { join } from 'path';

// Function to generate the index file
function generateIndexFile(dir) {
  const files = readdirSync(dir).filter((file) => file.endsWith('.js'));
  let indexContent = '';

  files.forEach((file) => {
    if (file === 'index.js') {
      return;
    }
    const moduleName = file.replace('.js', '');
    indexContent += `export * from './${moduleName}.js';\n`;
  });

  const indexPath = join(dir, 'index.js');
  writeFileSync(indexPath, indexContent);
  // eslint-disable-next-line no-undef, no-console
  console.log(`Index file generated at ${indexPath}`);
}

// Function to watch directories and regenerate index files on changes
function watchDirectories(dirs) {
  dirs.forEach((dir) => {
    watch(dir, { persistent: true, ignoreInitial: true }).on(
      'change',
      (filePath) => {
        // eslint-disable-next-line no-undef, no-console
        console.log(`Change detected in ${filePath}`);
        generateIndexFile(dir); // Regenerate index file when any file changes
      }
    );
  });
}

// Parse command-line arguments
// eslint-disable-next-line no-undef
const args = minimist(process.argv.slice(2));

// Set directories to watch
const directoriesToWatch = ['./repository', './utils', './config'];

// If the --watch flag is provided, watch directories; otherwise, directly generate index files
if (args.watch) {
  watchDirectories(directoriesToWatch);
} else {
  directoriesToWatch.forEach(generateIndexFile);
}
