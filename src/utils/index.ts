import fs from 'node:fs/promises';
import path from 'node:path';

export const cwd = process.cwd();

export async function getUtoolsConfig() {
  return JSON.parse((await fs.readFile(path.join(cwd, './public/plugin.json'))).toString());
}
