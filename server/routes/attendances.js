import { Router } from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { token, user_id } = req.body;

  if (!token || !user_id) {
    return res.status(400).json({ success: false, message: 'Token dan user_id harus diisi' });
  }

  const sessions = readDB('sessions');
  const session = sessions.find((s) => s.qr_token === token);

  if (!session) {
    return res.status(400).json({ success: false, message: 'QR tidak valid, silakan scan ulang' });
  }

  if (!session.aktif) {
    return res.status(400).json({ success: false, message: 'Sesi absen sudah ditutup oleh admin' });
  }

  const now = new Date();
  const validFrom = new Date(session.valid_from);
  const validUntil = new Date(session.valid_until);

  if (now < validFrom) {
    return res.status(400).json({ success: false, message: 'Sesi absen belum dimulai, tunggu hingga waktu yang ditentukan' });
  }

  if (now > validUntil) {
    return res.status(400).json({ success: false, message: 'QR sudah kadaluarsa, minta admin buat yang baru ya' });
  }

  const attendances = readDB('attendances');
  const sudahAbsen = attendances.some(
    (a) => a.user_id === user_id && a.session_id === session.id
  );

  if (sudahAbsen) {
    return res.status(400).json({ success: false, message: 'Kamu sudah absen di sesi ini' });
  }

  const attendance = {
    id: crypto.randomUUID(),
    user_id,
    session_id: session.id,
    waktu_scan: now.toISOString(),
    status: 'hadir',
  };

  attendances.push(attendance);
  writeDB('attendances', attendances);

  const users = readDB('users');
  const user = users.find((u) => u.id === user_id);

  res.status(201).json({
    success: true,
    message: 'Absen berhasil!',
    data: {
      nama: user?.nama || 'Mahasiswa',
      waktu: attendance.waktu_scan,
      kegiatan: session.nama_kegiatan,
    },
  });
});

router.get('/', (req, res) => {
  const { tanggal } = req.query;
  let attendances = readDB('attendances');
  const users = readDB('users');
  const sessions = readDB('sessions');

  if (tanggal) {
    attendances = attendances.filter((a) => a.waktu_scan.startsWith(tanggal));
  }

  const result = attendances.map((a) => {
    const user = users.find((u) => u.id === a.user_id);
    const session = sessions.find((s) => s.id === a.session_id);
    return {
      id: a.id,
      nama: user?.nama || 'Unknown',
      nim: user?.nim || '-',
      waktu_scan: a.waktu_scan,
      status: a.status,
      kegiatan: session?.nama_kegiatan || '-',
    };
  });

  res.json({ success: true, data: result });
});

export default router;
