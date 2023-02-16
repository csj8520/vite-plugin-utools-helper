import path from 'node:path';
import fs from 'node:fs/promises';
import { createGzip } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';

import { createPackage } from '@electron/asar';
import { PluginOption, ResolvedConfig } from 'vite';

import { getUtoolsConfig } from '../utils';

const cwd = process.cwd();

export interface UpxPluginOption {
  outDir?: string;
  outFileName?: string;
}

const defaultUpxOptions: Required<UpxPluginOption> = {
  outDir: 'upx',
  outFileName: '[pluginName]-[version].upx'
};

export function createUpxPlugin(options?: UpxPluginOption): PluginOption {
  const op = Object.assign({}, defaultUpxOptions, options || {});
  let config: ResolvedConfig;
  return {
    name: 'vite-plugin-utools-helper:upx',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      const utoolsConfig = await getUtoolsConfig();

      ['name', 'pluginName', 'description', 'author', 'homepage', 'version', 'logo', 'features'].forEach(
        key => utoolsConfig[key] || console.warn(`./public/plugin.json key: [${key}] is required`)
      );

      const tempAsar = path.join(cwd, op.outDir, '.temp.asar');

      // ref: https://github.com/13enBi/vite-plugin-utools/blob/main/src/buildUpx.ts
      await createPackage(config.build.outDir, tempAsar);

      const outFileName = op.outFileName.replace(/\[(\w+)\]/g, ($0, $1) => utoolsConfig[$1] || $0);

      await new Promise((resolve, reject) =>
        createReadStream(tempAsar)
          .pipe(createGzip())
          .pipe(createWriteStream(path.join(cwd, op.outDir, outFileName)))
          .on('error', reject)
          .on('finish', resolve)
      );
      await fs.unlink(tempAsar);
    }
  };
}
