import crypto from 'crypto';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const SALT_ROUNDS = 10;

async function hash(pw) {
  return bcrypt.hash(pw, SALT_ROUNDS);
}

async function main() {
  const users = [
    { id: crypto.randomUUID(), nim: 'admin', nama: 'Koordinator KKN', role: 'admin', email: '', password_hash: await hash('admin123') },
    { id: crypto.randomUUID(), nim: '220101001', nama: 'Andi Pratama', role: 'mahasiswa', email: '', password_hash: await hash('12345678') },
    { id: crypto.randomUUID(), nim: '220101002', nama: 'Siti Rahmawati', role: 'mahasiswa', email: '', password_hash: await hash('12345678') },
    { id: crypto.randomUUID(), nim: '220101003', nama: 'Budi Santoso', role: 'mahasiswa', email: '', password_hash: await hash('12345678') },
    { id: crypto.randomUUID(), nim: '220101004', nama: 'Dewi Lestari', role: 'mahasiswa', email: '', password_hash: await hash('12345678') },
  ];

  const session = {
    id: crypto.randomUUID(),
    qr_token: crypto.randomUUID(),
    tanggal_mulai: '2026-07-16',
    tanggal_selesai: '2026-08-23',
    status: 'aktif',
  };

  writeFileSync(join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
  writeFileSync(join(dataDir, 'sessions.json'), JSON.stringify([session], null, 2));
  writeFileSync(join(dataDir, 'attendances.json'), '[]');

  console.log('Seed data berhasil dibuat');
  console.log(`Admin    → NIM: admin / Password: admin123`);
  console.log(`User 1   → NIM: 220101001 / Password: 12345678`);
  console.log(`QR Token → ${session.qr_token}`);
  console.log(`Periode  → ${session.tanggal_mulai} s.d ${session.tanggal_selesai}`);
}

main();
