# Pre-Production: Sistem Absensi Online Berbasis QR Code untuk KKN

## 1. Latar Belakang
Selama kegiatan KKN, absensi manual (tanda tangan kertas) rawan masalah: mudah dititipkan, sulit direkap, dan tidak real-time. Sistem absensi berbasis QR Code memungkinkan mahasiswa melakukan scan saat hadir di lokasi/kegiatan, dengan data langsung tersimpan dan dapat dipantau oleh DPL (Dosen Pembimbing Lapangan) atau koordinator.

## 2. Tujuan
- Mempercepat proses absensi harian peserta KKN.
- Mencegah kecurangan (titip absen) dengan validasi lokasi/waktu.
- Merekap kehadiran secara otomatis dan bisa diekspor (Excel/PDF).
- Memberi transparansi kehadiran ke DPL/koordinator kampus.

## 3. Pengguna (User Roles)
| Role | Hak Akses |
|---|---|
| Mahasiswa peserta KKN | Scan QR, isi absensi, lihat riwayat presensi sendiri |
| Koordinator/Ketua Kelompok | Generate QR harian, lihat rekap kelompok |
| DPL/Admin | Lihat semua rekap, ekspor laporan, monitoring lokasi/waktu |

## 4. Fitur Utama
1. **Generate QR Code harian/per-sesi** — QR berubah tiap hari atau tiap sesi kegiatan agar tidak bisa dipakai ulang (screenshot orang lain).
2. **Scan QR untuk absen** — mahasiswa scan pakai kamera HP, otomatis submit data.
3. **Validasi lokasi (opsional, geofencing)** — memastikan mahasiswa benar-benar berada di lokasi KKN saat scan (menggunakan GPS radius tertentu).
4. **Timestamp otomatis** — waktu absen tercatat sistem, bukan input manual.
5. **Dashboard rekap kehadiran** — per individu, per kelompok, per tanggal.
6. **Ekspor laporan** — ke Excel/PDF untuk keperluan administrasi kampus.
7. **Notifikasi/reminder** (opsional) — pengingat jika belum absen di jam tertentu.
8. **Login sederhana** — NIM + password, atau login lewat email kampus.

## 5. Alur Sistem (Flow)
1. Koordinator/admin generate QR code untuk sesi hari itu (QR unik, biasanya berisi token + timestamp expiry).
2. QR ditampilkan di lokasi (dicetak/ditempel) atau dibagikan di grup WA saat briefing pagi.
3. Mahasiswa buka aplikasi/web, scan QR pakai kamera.
4. Sistem verifikasi:
   - Token QR masih valid (belum expired)?
   - Lokasi mahasiswa sesuai radius yang ditentukan? (jika pakai geofencing)
5. Jika valid → data absen tersimpan (nama, NIM, waktu, lokasi).
6. Mahasiswa dapat notifikasi "Absen berhasil".
7. Data masuk ke dashboard admin/DPL secara real-time.

## 6. Kebutuhan Non-Fungsional
- Bisa diakses dari HP (mobile-friendly / PWA agar tidak perlu install aplikasi native).
- Ringan, karena kemungkinan lokasi KKN memiliki sinyal internet terbatas.
- Data tersimpan aman (least tidak bisa diedit sembarangan oleh mahasiswa).
- QR code sebaiknya auto-refresh berkala supaya tidak disalahgunakan (foto lalu dipakai orang lain dari jauh — makanya kombinasi dengan validasi lokasi/waktu penting).

## 7. Rancangan Database (sederhana)
**Tabel `users`**
- id, nim, nama, role (mahasiswa/admin/dpl), password_hash, kelompok_id

**Tabel `sessions`** (sesi absen per hari/kegiatan)
- id, tanggal, nama_kegiatan, qr_token, valid_from, valid_until, lokasi_lat, lokasi_lng, radius_meter

**Tabel `attendances`**
- id, user_id, session_id, waktu_scan, lokasi_lat, lokasi_lng, status (hadir/telat/tidak_valid)

## 8. Rekomendasi Tech Stack
| Komponen | Opsi Sederhana | Opsi Lebih Lengkap |
|---|---|---|
| Frontend | HTML/JS + library scan QR (html5-qrcode) | React/Next.js + PWA |
| Backend | Google Apps Script + Google Sheets (paling cepat, gratis) | Node.js/Express + database |
| Database | Google Sheets | PostgreSQL/MySQL/Firebase |
| Hosting | Google Sites/Vercel gratis | Vercel/Railway/VPS kampus |
| QR Generator | Library JS (qrcode.js) | Sama |

> Untuk kebutuhan KKN yang biasanya jangka pendek (± 1-2 bulan) dan sederhana, opsi **Google Apps Script + Google Sheets** sangat direkomendasikan karena gratis, cepat dibuat, dan tidak perlu maintenance server.

## 9. Wireframe Kasar (Struktur Halaman)
1. **Halaman Login** — NIM & password.
2. **Halaman Scan QR** — kamera aktif, tombol scan.
3. **Halaman Konfirmasi** — "Absen berhasil pukul 07:32, lokasi terverifikasi".
4. **Halaman Riwayat Absen (mahasiswa)** — tabel tanggal, jam, status.
5. **Dashboard Admin** — tabel rekap semua mahasiswa, filter tanggal, tombol ekspor.

## 10. Timeline Pengembangan (Estimasi)
| Tahap | Durasi |
|---|---|
| Setup database & struktur data | 1 hari |
| Fitur generate QR + halaman scan | 2 hari |
| Fitur validasi lokasi & waktu | 1-2 hari |
| Dashboard rekap & ekspor | 1-2 hari |
| Testing di lokasi asli | 1 hari |

## 11. Catatan Tambahan
- Sebaiknya siapkan **mode offline/manual** sebagai cadangan jika sinyal internet di lokasi KKN buruk (misal input manual oleh koordinator lalu disinkronkan nanti).
- QR sebaiknya tidak statis selamanya — refresh harian minimal, agar tidak disalahgunakan.
