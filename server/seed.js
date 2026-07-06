import crypto from 'crypto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

function hash(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

const users = [
  { id: crypto.randomUUID(), nim: 'admin', nama: 'Koordinator KKN', role: 'admin', password_hash: hash('admin123'), kelompok_id: null },
  { id: crypto.randomUUID(), nim: '220101001', nama: 'Andi Pratama', role: 'mahasiswa', password_hash: hash('123456'), kelompok_id: 1 },
  { id: crypto.randomUUID(), nim: '220101002', nama: 'Siti Rahmawati', role: 'mahasiswa', password_hash: hash('123456'), kelompok_id: 1 },
  { id: crypto.randomUUID(), nim: '220101003', nama: 'Budi Santoso', role: 'mahasiswa', password_hash: hash('123456'), kelompok_id: 1 },
  { id: crypto.randomUUID(), nim: '220101004', nama: 'Dewi Lestari', role: 'mahasiswa', password_hash: hash('123456'), kelompok_id: 1 },
];

writeFileSync(join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
writeFileSync(join(dataDir, 'sessions.json'), '[]');
writeFileSync(join(dataDir, 'attendances.json'), '[]');

console.log('Seed data berhasil dibuat');
console.log(`Admin  → NIM: admin / Password: admin123`);
console.log(`User 1 → NIM: 220101001 / Password: 123456`);
