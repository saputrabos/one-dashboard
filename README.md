# One Dashboard

One Dashboard adalah platform Instagram Growth Intelligence berbasis Next.js dan FastAPI.

## Menjalankan frontend

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Menjalankan backend

Buka terminal baru:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend berjalan di http://127.0.0.1:8000 dan dokumentasi API tersedia di http://127.0.0.1:8000/docs.

## Follower Intelligence

Buka menu **Follower Intelligence** dari sidebar dashboard atau kunjungi http://localhost:3000/followers.

1. Unduh informasi Instagram melalui Accounts Center / Ekspor info Anda.
2. Pilih format JSON saat meminta ekspor.
3. Unggah file ZIP hasil ekspor, atau unggah `followers_1.json` dan `following.json` secara terpisah.
4. Masukkan username Instagram yang sesuai dengan data ekspor.
5. Impor pertama menjadi snapshot awal. Impor berikutnya dibandingkan untuk menghitung New Followers dan Unfollowers.

Data snapshot disimpan dalam SQLite pada `backend/followers.db`. File database lokal tersebut diabaikan Git dan tidak ikut terunggah ke repository.

**Catatan:** sistem ini menghitung unfollower berdasarkan perbandingan dua snapshot ekspor. Sistem tidak dapat mengetahui siapa yang unfollow sebelum snapshot pertama disimpan. Fitur ini menggunakan data ekspor resmi Instagram, bukan scraping atau password Instagram.

## Catatan autentikasi

Koneksi **Login dengan Meta** yang sudah ada adalah koneksi akun Instagram profesional, bukan autentikasi pengguna untuk masuk ke One Dashboard. Autentikasi pengguna aplikasi dan pembatasan akses per pengguna perlu dibuat terpisah sebelum aplikasi dipublikasikan untuk banyak pengguna.
