import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

function dbPath(name) {
  return join(DATA_DIR, `${name}.json`);
}

export function readDB(name) {
  const path = dbPath(name);
  if (!existsSync(path)) writeFileSync(path, '[]');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function writeDB(name, data) {
  writeFileSync(dbPath(name), JSON.stringify(data, null, 2));
}
