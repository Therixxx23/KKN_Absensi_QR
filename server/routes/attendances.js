import { Router } from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../db.js';

const router = Router();

function getSesiWaktu(now) {
  const jam = now.getHours();
  return jam < 15 ? 'siang' : 'sore';
}

router.post('/', (req, res) => {
  const { qrToken, userId, sesiWaktu: bodySesiWaktu } = req.body;

  if (!qrToken || !userId) {
    return res.status(400).json({ success: false, message: 'qrToken dan userId harus diisi' });
  }

  const sessions = readDB('sessions');
  const session = sessions.find((s) => s.qr_token === qrToken && s.status === 'aktif');

  if (!session) {
    return res.status(400).json({ success: false, message: 'QR tidak valid, silakan scan ulang' });
  }

  const now = new Date();
  const tanggalMulai = new Date(session.tanggal_mulai);
  const tanggalSelesai = new Date(session.tanggal_selesai);
  tanggalSelesai.setHours(23, 59, 59, 999);

  if (now < tanggalMulai) {
    return res.status(400).json({ success: false, message: 'Periode KKN belum dimulai' });
  }

  if (now > tanggalSelesai) {
    return res.status(400).json({ success: false, message: 'Periode KKN sudah berakhir' });
  }

  const sesiWaktu = bodySesiWaktu || getSesiWaktu(now);
  if (!['siang', 'sore'].includes(sesiWaktu)) {
    return res.status(400).json({ success: false, message: 'Sesi waktu harus "siang" atau "sore"' });
  }

  const todayStr = now.toISOString().split('T')[0];

  const attendances = readDB('attendances');
  const sudahAbsen = attendances.some(
    (a) =>
      a.user_id === userId &&
      a.waktu_scan.startsWith(todayStr) &&
      a.sesi_waktu === sesiWaktu
  );

  if (sudahAbsen) {
    return res.status(400).json({
      success: false,
      message: `Kamu sudah absen ${sesiWaktu} hari ini`,
    });
  }

  const attendance = {
    id: crypto.randomUUID(),
    user_id: userId,
    session_id: session.id,
    waktu_scan: now.toISOString(),
    sesi_waktu: sesiWaktu,
    status: 'hadir',
  };

  attendances.push(attendance);
  writeDB('attendances', attendances);

  const users = readDB('users');
  const user = users.find((u) => u.id === userId);

  res.status(201).json({
    success: true,
    message: `Absen ${sesiWaktu} berhasil!`,
    data: {
      nama: user?.nama || 'Mahasiswa',
      waktu: attendance.waktu_scan,
      sesi_waktu: sesiWaktu,
    },
  });
});

router.get('/', (req, res) => {
  const { tanggal } = req.query;
  let attendances = readDB('attendances');
  const users = readDB('users');

  if (tanggal) {
    attendances = attendances.filter((a) => a.waktu_scan.startsWith(tanggal));
  }

  const result = attendances.map((a) => {
    const user = users.find((u) => u.id === a.user_id);
    return {
      id: a.id,
      user_id: a.user_id,
      nama: user?.nama || 'Unknown',
      nim: user?.nim || '-',
      tanggal: a.waktu_scan.split('T')[0],
      waktu: a.waktu_scan,
      sesi_waktu: a.sesi_waktu,
      status: a.status,
    };
  });

  res.json({ success: true, data: result });
});

export default router;
