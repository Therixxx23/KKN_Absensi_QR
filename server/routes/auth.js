import { Router } from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../db.js';

const router = Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/login', (req, res) => {
  const { nim, password } = req.body;
  if (!nim || !password) {
    return res.status(400).json({ message: 'NIM dan password harus diisi' });
  }

  const users = readDB('users');
  const user = users.find((u) => u.nim === nim);

  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ message: 'NIM atau password salah' });
  }

  const token = crypto.randomUUID();
  user.token = token;
  writeDB('users', users);

  res.json({
    token,
    user: {
      id: user.id,
      nim: user.nim,
      nama: user.nama,
      role: user.role,
      kelompok_id: user.kelompok_id,
    },
  });
});

export default router;
