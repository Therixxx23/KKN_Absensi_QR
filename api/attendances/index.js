import { supabase } from '../../lib/supabaseClient.js';
import { requireRole } from '../../lib/requireRole.js';
import { getWIBHour, getWIBDateString, getWIBDayUTC } from '../../lib/dateHelper.js';

function validateWaktuAbsen() {
  const jam = getWIBHour();

  if (jam >= 6 && jam <= 12) {
    return { valid: true, sesiWaktu: 'siang' };
  }
  if (jam >= 17 && jam <= 21) {
    return { valid: true, sesiWaktu: 'sore' };
  }
  if (jam >= 13 && jam <= 16) {
    return { valid: false, message: 'Belum masuk jam absen sore (mulai 17:00)' };
  }
  return { valid: false, message: 'Di luar jam absen yang ditentukan (06:00-12:00 siang, 17:00-21:00 sore)' };
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
}

async function handlePost(req, res) {
  const { qrToken, userId, sesiWaktu: bodySesiWaktu } = req.body;

  if (!qrToken || !userId) {
    return res.status(400).json({ success: false, message: 'qrToken dan userId harus diisi' });
  }

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('qr_token', qrToken)
    .eq('status', 'aktif')
    .maybeSingle();

  if (sessionError || !session) {
    return res.status(400).json({ success: false, message: 'QR tidak valid, silakan scan ulang' });
  }

  const todayStr = getWIBDateString();

  if (todayStr < session.tanggal_mulai) {
    return res.status(400).json({ success: false, message: 'Periode absensi KKN belum dimulai' });
  }

  if (todayStr > session.tanggal_selesai) {
    return res.status(400).json({ success: false, message: 'Periode absensi KKN sudah berakhir' });
  }

  const validation = validateWaktuAbsen();
  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  if (bodySesiWaktu && bodySesiWaktu !== validation.sesiWaktu) {
    return res.status(400).json({
      success: false,
      message: `Sekarang jam absen ${validation.sesiWaktu}, bukan ${bodySesiWaktu}`,
    });
  }

  const sesiWaktu = validation.sesiWaktu;

  const wibDay = getWIBDayUTC();

  const { data: existing } = await supabase
    .from('attendances')
    .select('id')
    .eq('user_id', userId)
    .eq('sesi_waktu', sesiWaktu)
    .gte('waktu_absen', wibDay.start)
    .lte('waktu_absen', wibDay.end)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({
      success: false,
      message: `Kamu sudah absen ${sesiWaktu} hari ini`,
    });
  }

  const { data: attendance, error: insertError } = await supabase
    .from('attendances')
    .insert([
      {
        user_id: userId,
        session_id: session.id,
        waktu_absen: new Date().toISOString(),
        sesi_waktu: sesiWaktu,
      },
    ])
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ success: false, message: 'Gagal mencatat absen' });
  }

  const { data: user } = await supabase
    .from('users')
    .select('nama')
    .eq('id', userId)
    .maybeSingle();

  res.status(201).json({
    success: true,
    message: `Absen ${sesiWaktu} berhasil!`,
    data: {
      nama: user?.nama || 'Mahasiswa',
      waktu: attendance.waktu_absen,
      sesi_waktu: sesiWaktu,
    },
  });
}

async function handleGet(req, res) {
  const user = requireRole(['admin', 'dpl'])(req, res);
  if (!user) return;

  const { tanggal } = req.query;

  let query = supabase
    .from('attendances')
    .select('id, user_id, session_id, sesi_waktu, waktu_absen')
    .order('waktu_absen', { ascending: false });

  if (tanggal) {
    const tanggalStart = `${tanggal}T00:00:00.000Z`;
    const tanggalEnd = `${tanggal}T23:59:59.999Z`;
    query = query.gte('waktu_absen', tanggalStart).lte('waktu_absen', tanggalEnd);
  }

  const { data: attendances, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data absen' });
  }

  const userIds = [...new Set(attendances.map((a) => a.user_id))];

  const { data: users } = await supabase
    .from('users')
    .select('id, nama, nim')
    .in('id', userIds);

  const userMap = {};
  if (users) {
    users.forEach((u) => {
      userMap[u.id] = u;
    });
  }

  const result = attendances.map((a) => {
    const user = userMap[a.user_id] || {};
    return {
      id: a.id,
      user_id: a.user_id,
      nama: user.nama || 'Unknown',
      nim: user.nim || '-',
      tanggal: a.waktu_absen.split('T')[0],
      waktu: a.waktu_absen,
      sesi_waktu: a.sesi_waktu,
    };
  });

  res.json({ success: true, data: result });
}
