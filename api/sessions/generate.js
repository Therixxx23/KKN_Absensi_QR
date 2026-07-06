import crypto from 'crypto';
import { supabase } from '../../lib/supabaseClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { data: existing } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'aktif')
    .maybeSingle();

  if (existing) {
    return res.json({ success: true, message: 'QR KKN sudah tersedia', data: existing });
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert([
      {
        qr_token: crypto.randomUUID(),
        tanggal_mulai: '2026-07-16',
        tanggal_selesai: '2026-08-23',
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
