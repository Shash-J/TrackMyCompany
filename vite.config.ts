import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { APP_VERSION, APP_BUILD_DATE } from './src/version.ts'

// Publish a complete, content-versioned shell without mutating tracked sources.
function offlineShellPlugin(): Plugin {
  let outDir: string;
  return {
    name: 'offline-shell',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
        .flatMap(entry => entry.isDirectory()
          ? walk(path.join(dir, entry.name))
          : [path.join(dir, entry.name)]);
      const files = walk(outDir)
        .map(file => path.relative(outDir, file).replaceAll('\\', '/'))
        .filter(file => !['sw.js', 'version.json', 'CNAME'].includes(file))
        .sort();
      const workerPath = path.join(outDir, 'sw.js');
      const template = fs.readFileSync(workerPath, 'utf8');
      const hash = createHash('sha256').update(template).update(APP_VERSION).update(APP_BUILD_DATE);
      for (const file of files) hash.update(file).update(fs.readFileSync(path.join(outDir, file)));
      const revision = hash.digest('hex').slice(0, 16);
      fs.writeFileSync(workerPath, template
        .replace('__BUILD_REVISION__', revision)
        .replace('/* __PRECACHE_ASSETS__ */', files.map(file => JSON.stringify(`./${file}`)).join(',\n  ')));
      fs.writeFileSync(path.join(outDir, 'version.json'), JSON.stringify({
        version: APP_VERSION, buildDate: APP_BUILD_DATE, revision,
      }, null, 2));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), offlineShellPlugin()],
})
