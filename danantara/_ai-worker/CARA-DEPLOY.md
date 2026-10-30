# Deploy AI Assistant (Cloudflare Workers AI — gratis)

File di folder ini untuk Cloudflare, bukan bagian dari halaman (aman ikut ter-upload: tidak ada rahasia di dalamnya).

## 1. Buat Worker
1. Cloudflare → Workers & Pages → Create → **Start with Hello World!**
2. Nama: `karhutla-chat` → Deploy.
3. **Edit code** → hapus semua → tempel isi `worker.js` → **Deploy**.

## 2. Pasang Workers AI (wajib)
Worker → **Settings → Bindings → Add → Workers AI** → Variable name: `AI` → Deploy.
Tidak perlu API key.

## 3. Batas pertanyaan per pengunjung (opsional, disarankan)
1. Storage & Databases → **KV → Create** → nama `karhutla-chat-rate`.
2. Worker → Settings → Bindings → Add → **KV namespace** → Variable name `RATE`, pilih namespace tadi → Deploy.
Default 20 pertanyaan/jam per IP (ubah lewat variabel `RATE_LIMIT`).

## 4. Hubungkan ke dashboard
Kirim URL Worker (mis. `https://karhutla-chat.xxxx.workers.dev`) atau ganti sendiri baris `CHAT_ENDPOINT` di `chat.js`, lalu commit & push `index.html` dan `chat.js`.

## Catatan
- Kuota gratis Workers AI: 10.000 "neurons" per hari (di-reset tiap hari). Model 70B cukup boros; perkiraan puluhan pertanyaan per hari.
  Jika kuota habis, chat menampilkan "Kuota AI gratis hari ini sudah habis".
  Untuk lebih hemat, isi variabel `MODEL` dengan `@cf/meta/llama-3.1-8b-instruct-fast` (lebih banyak pertanyaan, jawaban kurang tajam).
- Perlindungan: penyaring topik (model kecil) menolak pertanyaan di luar data, jawaban dibatasi ±600 token, hanya teks (tanpa gambar/lampiran), hanya menerima permintaan dari garudalabs.co.id.
- Nama model Workers AI bisa berubah; cek di Cloudflare → AI → Workers AI → Models bila muncul error model.
