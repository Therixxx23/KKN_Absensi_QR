import { Router } from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../db.js';

const router = Router();

router.post('/generate', (req, res) => {
  const sessions = readDB('sessions');

  const existing = sessions.find((s) => s.status === 'aktif');
  if (existing) {
    return res.json({ success: true, message: 'QR KKN sudah tersedia', data: existing });
  }

  const session = {
    id: crypto.randomUUID(),
    qr_token: crypto.randomUUID(),
    tanggal_mulai: '2026-07-16',
    tanggal_selesai: '2026-08-23',
    status: 'aktif',
  };

  sessions.push(session);
  writeDB('sessions', sessions);

  res.status(201).json({ success: true, message: 'QR KKN berhasil dibuat', data: session });
});

router.get('/active', (req, res) => {
  const sessions = readDB('sessions');
  const now = new Date();
  const active = sessions.find((s) => {
    if (s.status !== 'aktif') return false;
    const mulai = new Date(s.tanggal_mulai);
    const selesai = new Date(s.tanggal_selesai);
    selesai.setHours(23, 59, 59, 999);
    return now >= mulai && now <= selesai;
  });

  res.json({ success: true, data: active || null });
});

export default router;
