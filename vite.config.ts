import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function pwaVersionSyncPlugin(): Plugin {
  return {
    name: 'pwa-version-sync',
    buildStart() {
      try {
        const rootDir = import.meta.dirname || process.cwd();
        const versionFilePath = path.resolve(rootDir, 'src/version.ts');
        if (fs.existsSync(versionFilePath)) {
          const versionContent = fs.readFileSync(versionFilePath, 'utf-8');
          const vMatch = versionContent.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
          const dMatch = versionContent.match(/APP_BUILD_DATE\s*=\s*['"]([^'"]+)['"]/);
          const appVersion = vMatch ? vMatch[1] : '1.4.2';
          const appBuildDate = dMatch ? dMatch[1] : new Date().toISOString().split('T')[0];

          // 1. Sync public/version.json
          const versionJsonPath = path.resolve(rootDir, 'public/version.json');
          fs.writeFileSync(
            versionJsonPath,
            JSON.stringify(
              {
                version: appVersion,
                buildDate: appBuildDate,
                timestamp: Date.now(),
              },
              null,
              2
            )
          );

          // 2. Sync public/sw.js
          const swPath = path.resolve(rootDir, 'public/sw.js');
          if (fs.existsSync(swPath)) {
            let swContent = fs.readFileSync(swPath, 'utf-8');
            swContent = swContent.replace(
              /const CACHE_NAME = ['"]trackmycompany-v[^'"]+['"];/,
              `const CACHE_NAME = 'trackmycompany-v${appVersion}';`
            );
            fs.writeFileSync(swPath, swContent);
          }
        }
      } catch (err) {
        console.warn('[Vite] Version sync plugin non-fatal error:', err);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [pwaVersionSyncPlugin(), react(), tailwindcss()],
})

