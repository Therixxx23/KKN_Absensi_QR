# Prompt Awal untuk opencode — Absensi QR KKN

Gunakan prompt ini secara bertahap di opencode. Jalankan satu tahap, review hasilnya, baru lanjut ke tahap berikutnya.

---

## Tahap 0 — Setup Project

```
Buatkan struktur project fullstack untuk aplikasi absensi QR KKN:
- frontend/: React (Vite) + react-router-dom + axios + html5-qrcode + qrcode.react
- backend/: Node.js + Express, data disimpan di file JSON (backend/data/*.json)
Ikuti struktur folder dan aturan coding di AGENTS.md.
```

---

## Tahap 1 — Login & Register

```
Buatkan sistem autentikasi mahasiswa:

Backend (routes/auth.js):
- POST /api/auth/register
  Body: { nama, nim, email (opsional), password, kelompok }
  - Cek NIM unik di data/users.json
  - Hash password dengan bcrypt
  - Role otomatis "mahasiswa"
  - Simpan ke users.json
  - Return { success, message }
- POST /api/auth/login
  Body: { nim, password }
  - Cek NIM ada, cocokkan password dengan bcrypt.compare
  - Return token sederhana (JWT atau session id) + data user (tanpa password)

Frontend:
- Halaman Login.jsx: form NIM + password, link ke Register
- Halaman Register.jsx: form Nama, NIM, Email (opsional), Password, Kelompok KKN
  - Validasi frontend dasar (NIM angka, password min 8 karakter)
  - Tampilkan error dari backend (misal NIM sudah terdaftar)
  - Setelah sukses, redirect ke Login dengan notifikasi sukses

Ikuti gaya UI di DESIGN.md bagian Login & Register.
```

---

## Tahap 2 — Backend Dasar (Sessions & Attendances)

```
Buatkan struktur data dan endpoint dasar untuk:
- sessions.json: { id, tanggal, jamMulai, jamSelesai, qrToken }
- attendances.json: { id, userId, sessionId, waktuAbsen }

Endpoint:
- GET /api/sessions/today — ambil sesi absen hari ini (kalau ada)
- GET /api/attendances — rekap semua kehadiran (khusus admin)
```

---

## Tahap 3 — Admin Generate QR

```
Buatkan halaman AdminGenerateQR.jsx:
- Tombol "Generate QR Hari Ini" → panggil POST /api/sessions/generate
- Backend generate token unik untuk sesi hari ini, simpan ke sessions.json
- Tampilkan QR code besar menggunakan qrcode.react, berisi token sesi
- Tampilkan info tanggal & jam berlaku sesi
```

---

## Tahap 4 — Scan Absen (Mahasiswa)

```
Buatkan halaman ScanAbsen.jsx:
- Gunakan html5-qrcode untuk scan QR dari kamera
- Setelah scan berhasil, kirim POST /api/attendances dengan { userId, qrToken }
- Backend validasi: token cocok dengan sesi aktif hari ini, dan user belum absen di sesi ini
- Tampilkan konfirmasi "Absen berhasil ✓" sesuai DESIGN.md
```

---

## Tahap 5 — Dashboard Rekap

```
Buatkan halaman Dashboard.jsx (khusus admin/DPL):
- Tabel rekap kehadiran semua mahasiswa
- Filter by tanggal dan kelompok
- Indikator visual hadir/tidak hadir sesuai DESIGN.md
- Data diambil dari GET /api/attendances
```

---

## Catatan
- Setelah tiap tahap, commit dengan pesan jelas (lihat AGENTS.md bagian Git Workflow)
- Validasi NIM terhadap "daftar peserta KKN resmi" sengaja belum diimplementasikan di versi awal ini — bisa ditambahkan belakangan sebagai peningkatan keamanan
