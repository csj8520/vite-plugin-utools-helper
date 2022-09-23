import { builtinModules } from 'node:module';

import { findExports } from 'mlly';
import { build, PluginOption, mergeConfig } from 'vite';
import { getUtoolsConfig } from '../utils';

export interface PreloadPluginOption {
  name?: string;
  path?: string;
}

const defaultPreloadOptions: Required<PreloadPluginOption> = {
  name: 'window.preload',
  path: 'src/preload/index.ts'
};

export function createPreloadPlugin(options?: PreloadPluginOption): PluginOption {
  const op = Object.assign({}, defaultPreloadOptions, options || {});

  return {
    name: 'vite-plugin-utools-helper:preload',
    config: config => {
      return mergeConfig(config, { build: { emptyOutDir: false } });
    },
    configResolved: async config => {
      const utoolsConfig = await getUtoolsConfig();
      const entryFileNames = utoolsConfig?.development?.preload ?? utoolsConfig?.preload ?? 'preload.js';
      await build({
        configFile: false,
        mode: config.mode,
        build: {
          outDir: config.build?.outDir,
          minify: false,
          emptyOutDir: true,
          watch: config.mode === 'development' ? {} : null,
          lib: {
            entry: op.path,
            formats: ['cjs']
          },
          rollupOptions: {
            external: builtinModules,
            output: {
              entryFileNames,
              exports: 'named'
            }
          }
        },
        plugins: [
          {
            name: 'vite-plugin-utools-helper:preload-inject',
            apply: 'build',
            enforce: 'post',
            transform(code, id, _options) {
              if (!id.includes(op.path)) return code;
              const names: string[] = [];
              const exports = findExports(code);
              const injectDefaultPreload = `${op.name} = ${op.name} || {};\n`;
              let offset = injectDefaultPreload.length;
              code = injectDefaultPreload + code;
              for (const it of exports.sort((a, b) => a.start - b.start)) {
                const length = code.length;
                if (it.type === 'declaration') {
                  code = code.slice(0, it.start + offset) + it.code.replace(/export\s*/, '') + code.slice(it.end + offset);
                  names.push(...it.names);
                } else if (it.type === 'named') {
                  code = code.slice(0, it.start + offset) + code.slice(it.end + offset);
                  names.push(...it.names);
                } else if (it.type === 'star') {
                  const name = `_dynamicExports_${it.specifier?.replace('./', '').replace(/[\/\-]/, '_')}`;
                  code = code.slice(0, it.start + offset) + `import * as ${name} from "${it.specifier}"` + code.slice(it.end + offset);
                  names.push(`...${name}`);
                } else {
                  code = code.slice(0, it.start + offset) + `${op.name}.default = ` + code.slice(it.end + offset);
                }
                offset += code.length - length;
              }
              code += `Object.assign(${op.name}, { ${names.join(', ')} })`;
              return code;
            }
          }
        ]
      });
    }
  };
}
