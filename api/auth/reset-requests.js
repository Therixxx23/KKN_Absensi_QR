import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { supabase } from '../../lib/supabaseClient.js';
import { requireRole } from '../../lib/requireRole.js';

export default async function handler(req, res) {
  const user = requireRole(['admin'])(req, res);
  if (!user) return;

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
}

async function handleGet(req, res) {
  const { data: requests, error } = await supabase
    .from('password_reset_requests')
    .select('id, user_id, nim, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data permintaan reset' });
  }

  const userIds = [...new Set(requests.map((r) => r.user_id))];

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

  const result = requests.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    nim: r.nim,
    nama: userMap[r.user_id]?.nama || 'Unknown',
    status: r.status,
    created_at: r.created_at,
  }));

  res.json({ success: true, data: result });
}

async function handlePost(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Parameter id harus diisi' });
  }

  const { data: request, error: findError } = await supabase
    .from('password_reset_requests')
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .maybeSingle();

  if (findError || !request) {
    return res.status(404).json({ success: false, message: 'Permintaan reset tidak ditemukan atau sudah diproses' });
  }

  const newPassword = crypto.randomBytes(4).toString('hex');
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error: updateUserError } = await supabase
    .from('users')
    .update({ password: passwordHash })
    .eq('id', request.user_id);

  if (updateUserError) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui password' });
  }

  const { error: updateRequestError } = await supabase
    .from('password_reset_requests')
    .update({ status: 'selesai' })
    .eq('id', id);

  if (updateRequestError) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status permintaan' });
  }

  res.json({
    success: true,
    message: 'Password baru berhasil dibuat',
    data: {
      user_id: request.user_id,
      nim: request.nim,
      new_password: newPassword,
    },
  });
}
