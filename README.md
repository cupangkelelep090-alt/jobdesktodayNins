# To Do List Today

Website simpel buat nulis to-do list tiap pagi, tersimpan online, dan otomatis
diingetin lewat Telegram sesuai jam yang kamu set. Full gratis, hosting di
Netlify, gak perlu beli domain (kamu dapet subdomain gratis kayak
`nama-app-kamu.netlify.app`).

## Cara kerja singkat
- **Frontend** (`public/index.html`) — halaman buat nulis & centang task.
- **Netlify Blobs** — nyimpen data task, bawaan Netlify, gratis, gak perlu bikin database sendiri.
- **Netlify Scheduled Function** (`netlify/functions/scheduled-reminder.js`) — jalan otomatis tiap 15 menit, ngecek task yang jamnya udah tiba, terus kirim ke Telegram kamu.

---

## Langkah 1 — Bikin bot Telegram (5 menit)

1. Buka Telegram, cari **@BotFather**.
2. Kirim `/newbot`, ikutin instruksinya (kasih nama & username bot).
3. BotFather bakal kasih **token**, formatnya kayak `123456789:AAExxxxxxx...`. Simpen ini.
4. Cari & chat bot **@userinfobot** di Telegram, dia bakal kasih tau **Chat ID** kamu (angka, misal `987654321`). Simpen ini juga.
5. Penting: buka chat sama bot yang baru kamu buat tadi, kirim pesan apa aja (misal "halo") — ini wajib biar bot boleh ngirim pesan ke kamu duluan.

## Langkah 2 — Upload project ke GitHub

1. Bikin repository baru di GitHub (bisa private).
2. Upload semua file di folder `todo-telegram` ini ke repo tersebut.

## Langkah 3 — Deploy ke Netlify

1. Buka [netlify.com](https://www.netlify.com), daftar/login (bisa pakai akun GitHub).
2. Klik **Add new site → Import an existing project**, pilih repo GitHub yang tadi.
3. Build settings biarin default (Netlify bakal otomatis kebaca dari `netlify.toml`). Klik **Deploy**.
4. Setelah selesai deploy, kamu dapet URL gratis kayak `https://nama-acak.netlify.app` — bisa diganti nama di **Site settings → Change site name**.

## Langkah 4 — Aktifin Netlify Blobs

Netlify Blobs otomatis aktif begitu function pertama kali jalan — gak ada setup tambahan.

## Langkah 5 — Set Environment Variables

Di dashboard Netlify: **Site settings → Environment variables → Add a variable**, tambahin:

| Key | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | token dari BotFather |
| `TELEGRAM_CHAT_ID` | chat ID kamu dari @userinfobot |
| `APP_TZ_OFFSET` | `7` (WIB) — ganti `8` kalau WITA, `9` kalau WIT |

Setelah nambahin env var, klik **Deploys → Trigger deploy → Deploy site** biar ke-apply.

## Langkah 6 — Coba

1. Buka URL Netlify kamu.
2. Tulis task + jam (misal 5 menit dari sekarang) → **Tambah**.
3. Tunggu sampai jadwal scheduled function jalan (paling lama 15 menit sekali) → Telegram kamu bakal dapet notif otomatis.

---

## Kalau mau ubah interval pengecekan

Default-nya tiap 15 menit (`*/15 * * * *` di `netlify.toml` dan `scheduled-reminder.js`).
Mau lebih rapat, misal tiap 5 menit, ganti jadi `*/5 * * * *` di kedua file itu,
lalu push ulang ke GitHub (Netlify auto-redeploy).

## Struktur folder

```
todo-telegram/
├── netlify.toml                        # konfigurasi Netlify + jadwal cron
├── package.json
├── public/
│   └── index.html                      # halaman web to-do list
└── netlify/functions/
    ├── tasks.js                        # API simpan/ambil/hapus task
    └── scheduled-reminder.js           # cek jadwal & kirim ke Telegram
```
