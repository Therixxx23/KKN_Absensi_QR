import crypto from 'crypto';
import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { tanggalMulai, tanggalSelesai } = req.body;

  if (!tanggalMulai || !tanggalSelesai) {
    return res.status(400).json({ success: false, message: 'tanggalMulai dan tanggalSelesai harus diisi' });
  }

  const { error: deactivateError } = await supabase
    .from('sessions')
    .update({ status: 'nonaktif' })
    .eq('status', 'aktif');

  if (deactivateError) {
    return res.status(500).json({ success: false, message: 'Gagal menonaktifkan sesi lama' });
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert([
      {
        qr_token: crypto.randomUUID(),
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        status: 'aktif',
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal membuat QR KKN' });
  }

  res.status(201).json({ success: true, message: 'QR KKN berhasil dibuat', data: session });
}
