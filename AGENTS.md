# AGENTS.md — Panduan untuk AI Coding Agent (opencode)

## Tech Stack
- **Frontend**: React (Vite) + `html5-qrcode` (scan QR) + `qrcode.react` (generate QR) + `react-router-dom` + `axios`
- **Backend**: Vercel Serverless Functions + Supabase (PostgreSQL)
- **Auth**: bcrypt untuk hash password, JWT untuk token
- **Deployment**: Frontend + Backend → Vercel (monorepo dengan folder `api/`)
- **Database**: Supabase (PostgreSQL)

## Struktur Folder
```
kkn-absensi-qr/
├── api/                   # Vercel Serverless Functions
│   ├── auth/
│   │   ├── register.js    # POST - daftar mahasiswa
│   │   ├── login.js       # POST - login, return JWT
│   │   └── verify.js      # GET - verifikasi JWT
│   ├── sessions/
│   │   ├── today.js       # GET - ambil sesi QR aktif
│   │   └── generate.js    # POST - generate sesi QR baru
│   └── attendances/
│       └── index.js       # POST - submit absen, GET - rekap
├── lib/
│   └── supabaseClient.js  # Koneksi Supabase dari env var
├── src/                   # Frontend React
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ScanAbsen.jsx
│   │   └── DashboardAdmin.jsx
│   ├── components/
│   │   └── ...
│   └── services/api.js
├── server/                # (deprecated) Express backend lama — tidak dipakai di Vercel
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── index.js
├── vercel.json
├── render.yaml            # (opsional) untuk deploy backend alternatif
└── .env.example
```

## Alur Auth (JWT)
- **Register**: password di-hash bcrypt, role otomatis `mahasiswa`. NIM dicek unik via Supabase.
- **Login**: verifikasi password dengan bcrypt.compare, generate JWT (`jsonwebtoken.sign`) dengan payload `{ id, nim, role }`, expire 7 hari.
- **Verify**: decode JWT (`jsonwebtoken.verify`), ambil user dari Supabase berdasarkan `decoded.id`.

Environment variables yang perlu di Vercel:
- `SUPABASE_URL` — URL project Supabase
- `SUPABASE_KEY` — Service role key (atau anon key dengan RLS diatur sesuai kebutuhan)
- `JWT_SECRET` — Secret untuk sign/verify JWT

## Aturan Coding
- Konsisten pakai async/await, hindari callback bertumpuk
- Setiap endpoint backend wajib return format `{ success, message, data? }`
- Validasi input di sisi backend, jangan percaya validasi frontend saja
- Password TIDAK PERNAH disimpan plain text — selalu lewat bcrypt
- File di `api/` export default function handler(req, res) sesuai format Vercel Serverless Functions
- Branching method (GET/POST) dilakukan manual di dalam handler

## Environment Variables (Vercel)
| Variable        | Wajib | Keterangan                              |
|-----------------|-------|-----------------------------------------|
| SUPABASE_URL    | Ya    | URL project Supabase                    |
| SUPABASE_KEY    | Ya    | Supabase anon key atau service_role key |
| JWT_SECRET      | Ya    | Secret key untuk JWT                    |

## Development Lokal
1. Jalankan Express backend lama di `server/` untuk testing API:
   ```bash
   cd server
   npm install
   npm run dev
   ```
2. Jalankan frontend dengan Vite:
   ```bash
   npm run dev
   ```
   Vite proxy akan meneruskan `/api/*` ke `http://localhost:5000`.

## Git Workflow (Wajib)
- Commit kecil per fitur, message jelas
- Branch terpisah untuk fitur besar
- Sebelum merge ke `main`: pastikan fitur sudah dites manual jalan
- Rollback pakai `git revert <commit-hash>`
