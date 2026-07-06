import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function dbPath(name) {
  return join(__dirname, 'data', `${name}.json`);
}

function readDB(name) {
  const path = dbPath(name);
  if (!existsSync(path)) writeFileSync(path, '[]');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeDB(name, data) {
  writeFileSync(dbPath(name), JSON.stringify(data, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
