/**
 * Update Version Task
 * Syncs version from CHANGELOG.md to package.json and .env
 * - Local: skips file writes to avoid dirty git state
 * - CI/Production: syncs version to ensure consistency
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

/**
 * @param {Object} config
 * @param {string} config.changelogPath
 * @param {string} config.packagePath
 * @param {string} config.envPath
 */
export function updateVersionTask(config) {
  return {
    name: 'update-version',
    title: 'Sync version from CHANGELOG',
    config,
    run: async (cfg, ctx) => {
      const changelog = readFileSync(cfg.changelogPath, 'utf-8');
      const match = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);

      if (!match) {
        throw new Error('Could not find version in CHANGELOG.md');
      }

      const version = match[1];
      ctx.logger.info(`Found version: ${version}`);

      // Local dev mode: skip file writes to avoid dirty git state
      const isLocal = !process.env.CI && process.env.NODE_ENV !== 'production';
      if (isLocal) {
        ctx.logger.info('Local mode: skipping version file updates');
        return { version };
      }

      // Update package.json
      const packageJson = JSON.parse(readFileSync(cfg.packagePath, 'utf-8'));
      if (packageJson.version !== version) {
        packageJson.version = version;
        writeFileSync(cfg.packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        ctx.logger.info(`Updated package.json to ${version}`);
      }

      // Update .env
      let envContent = existsSync(cfg.envPath) ? readFileSync(cfg.envPath, 'utf-8') : '';
      const envVar = `VITE_APP_VERSION=${version}`;
      const envRegex = /^VITE_APP_VERSION=.*$/m;

      if (envRegex.test(envContent)) {
        envContent = envContent.replace(envRegex, envVar);
      } else {
        envContent += `\n${envVar}\n`;
      }

      writeFileSync(cfg.envPath, envContent.trim() + '\n');
      ctx.logger.info(`Updated .env with ${envVar}`);

      return { version };
    },
  };
}
