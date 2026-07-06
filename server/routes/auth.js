import { Router } from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { nama, nim, email, password } = req.body;

  if (!nama || !nim || !password) {
    return res.status(400).json({ success: false, message: 'Nama, NIM, dan password harus diisi' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
  }

  const users = readDB('users');
  const existing = users.find((u) => u.nim === nim);
  if (existing) {
    return res.status(400).json({ success: false, message: 'NIM sudah terdaftar' });
  }

  const password_hash = await hashPassword(password);

  const user = {
    id: crypto.randomUUID(),
    nim,
    nama,
    email: email || '',
    password_hash,
    role: 'mahasiswa',

  };

  users.push(user);
  writeDB('users', users);

  res.status(201).json({ success: true, message: 'Registrasi berhasil, silakan login' });
});

router.post('/login', async (req, res) => {
  const { nim, password } = req.body;
  if (!nim || !password) {
    return res.status(400).json({ success: false, message: 'NIM dan password harus diisi' });
  }

  const users = readDB('users');
  const user = users.find((u) => u.nim === nim);

  if (!user) {
    return res.status(401).json({ success: false, message: 'NIM atau password salah' });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'NIM atau password salah' });
  }

  const token = crypto.randomUUID();
  user.token = token;
  writeDB('users', users);

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      token,
      user: {
        id: user.id,
        nim: user.nim,
        nama: user.nama,
        role: user.role,
      },
    },
  });
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  const users = readDB('users');
  const user = users.find((u) => u.token === token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      nim: user.nim,
      nama: user.nama,
      role: user.role,
    },
  });
});

export default router;
