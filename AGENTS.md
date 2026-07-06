# AGENTS.md — Panduan untuk AI Coding Agent (opencode)

## Tech Stack
- **Frontend**: React (Vite) + `html5-qrcode` (scan QR) + `qrcode.react` (generate QR) + `react-router-dom` + `axios`
- **Backend**: Node.js + Express, database awal pakai file JSON (rencana upgrade ke Supabase/PostgreSQL untuk production)
- **Auth**: bcrypt untuk hash password
- **Deployment**: Frontend → Vercel, Backend → Railway/Render

## Struktur Folder (usulan)
```
absensi-qr-kkn/
├── backend/
│   ├── data/
│   │   ├── users.json
│   │   ├── sessions.json
│   │   └── attendances.json
│   ├── routes/
│   │   ├── auth.js        # login + register
│   │   ├── sessions.js
│   │   └── attendances.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── utils/
│   │   └── hash.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx      # BARU
    │   │   ├── ScanAbsen.jsx
    │   │   ├── AdminGenerateQR.jsx
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   ├── services/api.js
    │   └── App.jsx
```

## Urutan Prioritas Fitur (Updated)
1. Setup project (frontend + backend scaffolding)
2. **Login & Register** (mahasiswa bisa daftar sendiri, admin/DPL dibuat manual)
3. Backend dasar (struktur data users, sessions, attendances)
4. Admin generate QR harian
5. Scan absen (mahasiswa)
6. Dashboard rekap kehadiran

## Rancangan Fitur Register (BARU)
- Form: Nama, NIM, Email (opsional), Password, Kelompok KKN
- Validasi:
  - NIM harus unik (cek ke `users.json` sebelum simpan)
  - Password minimal 8 karakter, di-hash dengan bcrypt sebelum disimpan
  - Role otomatis diset `"mahasiswa"` saat register mandiri — TIDAK bisa dipilih dari form
  - Role `"admin"` / `"dpl"` hanya dibuat manual langsung di `users.json` atau lewat script seed, bukan lewat form register
- Endpoint: `POST /api/auth/register`
  - Body: `{ nama, nim, email?, password, kelompok }`
  - Response sukses: `{ success: true, message: "Registrasi berhasil, silakan login" }`
  - Response gagal (NIM sudah ada): `{ success: false, message: "NIM sudah terdaftar" }`
- **Catatan keamanan (versi awal)**: Register masih terbuka untuk NIM apa saja (tidak divalidasi ke daftar peserta KKN resmi). Ini adalah simplifikasi yang disengaja untuk versi awal/sederhana. Kalau nanti mau lebih aman, tambahkan tabel/list `peserta_resmi` (NIM + nama yang sudah didata panitia) dan validasi NIM harus ada di list itu sebelum register diterima.

## Aturan Coding
- Konsisten pakai async/await, hindari callback bertumpuk
- Setiap endpoint backend wajib return format `{ success, message, data? }`
- Validasi input di sisi backend, jangan percaya validasi frontend saja
- Password TIDAK PERNAH disimpan plain text — selalu lewat bcrypt (`bcrypt.hash`, `bcrypt.compare`)
- Pisahkan logic auth (login/register) di `routes/auth.js`, jangan campur dengan routes lain

## Git Workflow (Wajib)
- Commit kecil per fitur, message jelas (contoh: `feat: add register page`, `fix: validate unique NIM`)
- Branch terpisah untuk fitur besar (contoh: `feature/register`, `feature/admin-qr`)
- Sebelum merge ke `main`: pastikan fitur sudah dites manual jalan
- Rollback pakai `git revert <commit-hash>` — jangan pakai `git reset --hard` di branch yang sudah di-push bareng

## Checklist Sebelum Push
- [ ] Tidak ada `console.log` sisa debugging
- [ ] Tidak ada credential/password hardcoded
- [ ] Endpoint baru sudah dites (Postman/Thunder Client atau manual dari frontend)
- [ ] File JSON data tidak ikut ter-commit kalau isinya data testing sensitif
