import crypto from 'crypto';
import { supabase } from '../../lib/supabaseClient.js';
import { requireRole } from '../../lib/requireRole.js';

export default async function handler(req, res) {
  const user =
    req.method === 'GET'
      ? requireRole(['admin'])(req, res)
      : req.method === 'POST'
        ? requireRole(['admin'])(req, res)
        : req.method === 'DELETE'
          ? requireRole(['admin'])(req, res)
          : null;
  if (!user) return;

  if (req.method === 'POST') return handlePost(req, res);
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
}

async function handlePost(req, res) {
  const { tanggalMulai, tanggalSelesai } = req.body;

  if (!tanggalMulai || !tanggalSelesai) {
    return res.status(400).json({ success: false, message: 'tanggalMulai dan tanggalSelesai harus diisi' });
  }

  const mulai = new Date(tanggalMulai);
  const selesai = new Date(tanggalSelesai);

  if (isNaN(mulai.getTime()) || isNaN(selesai.getTime())) {
    return res.status(400).json({ success: false, message: 'Format tanggal tidak valid' });
  }

  if (selesai < mulai) {
    return res.status(400).json({ success: false, message: 'tanggalSelesai harus setelah tanggalMulai' });
  }

  const { error: deactivateError } = await supabase
    .from('sessions')
    .update({ status: 'nonaktif' })
    .eq('status', 'aktif');

  if (deactivateError) {
    return res.status(500).json({ success: false, message: 'Gagal menonaktifkan sesi lama' });
  }

  const { data: session, error: insertError } = await supabase
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

  if (insertError) {
    return res.status(500).json({ success: false, message: 'Gagal membuat sesi baru' });
  }

  res.status(201).json({ success: true, message: 'Sesi QR berhasil dibuat', data: session });
}

async function handleGet(req, res) {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar sesi' });
  }

  const { data: attendCounts } = await supabase
    .from('attendances')
    .select('session_id');

  const countMap = {};
  if (attendCounts) {
    attendCounts.forEach((a) => {
      countMap[a.session_id] = (countMap[a.session_id] || 0) + 1;
    });
  }

  const result = sessions.map((s) => ({
    ...s,
    total_absen: countMap[s.id] || 0,
  }));

  res.json({ success: true, data: result });
}

async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Parameter id harus diisi' });
  }

  const { data: session, error: findError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (findError || !session) {
    return res.status(404).json({ success: false, message: 'Sesi tidak ditemukan' });
  }

  const { error: deleteError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus sesi' });
  }

  res.json({ success: true, message: 'Sesi berhasil dihapus', data: { total_absen: 0 } });
}
