import { Router } from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { nama_kegiatan, valid_from, valid_until } = req.body;

  if (!nama_kegiatan || !valid_from || !valid_until) {
    return res.status(400).json({ success: false, message: 'nama_kegiatan, valid_from, dan valid_until harus diisi' });
  }

  const sessions = readDB('sessions');
  const session = {
    id: crypto.randomUUID(),
    tanggal: new Date().toISOString().split('T')[0],
    nama_kegiatan,
    qr_token: crypto.randomUUID(),
    valid_from,
    valid_until,
    aktif: true,
  };

  sessions.push(session);
  writeDB('sessions', sessions);

  res.status(201).json({ success: true, message: 'Sesi absen berhasil dibuat', data: session });
});

router.get('/active', (req, res) => {
  const sessions = readDB('sessions');
  const now = new Date().toISOString();
  const active = sessions.filter(
    (s) => s.aktif && s.valid_from <= now && s.valid_until >= now
  );
  res.json({ success: true, data: active });
});

router.get('/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const sessions = readDB('sessions');
  const todaySessions = sessions.filter((s) => s.tanggal === today);
  res.json({ success: true, data: todaySessions });
});

router.post('/generate', (req, res) => {
  const { nama_kegiatan, valid_from, valid_until } = req.body;

  if (!nama_kegiatan || !valid_from || !valid_until) {
    return res.status(400).json({ success: false, message: 'nama_kegiatan, valid_from, dan valid_until harus diisi' });
  }

  const sessions = readDB('sessions');
  const session = {
    id: crypto.randomUUID(),
    tanggal: new Date().toISOString().split('T')[0],
    nama_kegiatan,
    qr_token: crypto.randomUUID(),
    valid_from,
    valid_until,
    aktif: true,
  };

  sessions.push(session);
  writeDB('sessions', sessions);

  res.status(201).json({ success: true, message: 'QR sesi berhasil dibuat', data: session });
});

export default router;
