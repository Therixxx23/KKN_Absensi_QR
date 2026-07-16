import { supabase } from '../../lib/supabaseClient.js';
import { getWIBDateString } from '../../lib/dateHelper.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const todayStr = getWIBDateString();

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'aktif')
    .lte('tanggal_mulai', todayStr)
    .gte('tanggal_selesai', todayStr)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil sesi' });
  }

  res.json({ success: true, data: session || null });
}
