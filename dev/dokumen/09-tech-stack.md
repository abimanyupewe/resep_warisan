## 9. Rekomendasi Tech Stack

### 9.1 Perbandingan opsi

| Aspek | Opsi A: Next.js + Neon + Cloudinary di Vercel | Opsi B: Next.js + Supabase di Vercel | Opsi C: Laravel + MySQL di shared hosting |
|---|---|---|---|
| Kelebihan | Satu bahasa (TypeScript) untuk frontend dan backend, Neon otomatis bangun saat ada permintaan sehingga cocok untuk aplikasi yang jarang dibuka, Cloudinary kuat untuk transformasi foto | Auth, database, dan penyimpanan foto dalam satu layanan, setup awal cepat | Teknologi yang umum diajarkan di kampus, hosting lokal Indonesia banyak pilihan |
| Kekurangan | Tiga layanan terpisah yang harus dikelola akunnya, kuota tiap layanan harus dipantau | Proyek paket gratis dijeda jika aktivitas rendah selama 7 hari dan harus diaktifkan manual, berisiko untuk aplikasi keluarga yang jarang dibuka | Tidak gratis, harus mengurus server sendiri, tidak sesuai keputusan memakai Vercel |
| Biaya hosting | Gratis dalam batas kuota paket Hobby Vercel, Free Neon, dan Free Cloudinary | Gratis dalam batas kuota, tetapi ada risiko jeda proyek | Berbayar, harga bervariasi per penyedia |

### 9.2 Pilihan dan alasan

**Pilihan: Opsi A** [K], dengan alasan:
1. Sesuai keputusan memakai Next.js, Vercel, Neon, dan Cloudinary.
2. Memenuhi syarat biaya gratis.
3. Tidak ada risiko jeda proyek otomatis seperti di Opsi B.
4. Paket Hobby Vercel memang diperuntukkan bagi pemakaian pribadi non komersial, cocok dengan aplikasi keluarga ini.

### 9.3 Rincian stack

| Lapisan | Pilihan | Catatan | Sumber |
|---|---|---|---|
| Framework | Next.js (App Router) dengan TypeScript | Frontend dan backend (Route Handlers, Server Actions) | [K] Next.js, [A] TypeScript |
| Tampilan | Tailwind CSS | Mudah membuat ukuran huruf dan tombol besar secara konsisten | [A] |
| Database | Neon Postgres | Paket Free | [K] |
| Akses database | Prisma ORM dengan adapter Neon (@prisma/adapter-neon) | Skema di `prisma/schema.prisma`, migrasi lewat `prisma migrate` memakai koneksi langsung (DIRECT_URL), aplikasi memakai koneksi pooled (DATABASE_URL) | [K] Prisma, [A] adapter |
| Autentikasi | Better Auth (email dan password, plugin admin) | Plugin admin menyediakan pengelolaan pengguna termasuk mengatur password | [A] |
| Validasi | Zod | Validasi input formulir di server | [A] |
| Foto | Cloudinary, unggah lewat signed upload dari server | Paket Free | [K] |
| Kompresi foto | browser-image-compression | Foto masakan maksimal sisi panjang 1600 px, foto tulisan asli maksimal 2400 px agar tetap terbaca untuk OCR nanti | [A] |
| PDF | @react-pdf/renderer | Dijalankan di browser | [A] |
| Backup | googleapis (klien Node.js resmi Google) ke Google Drive | Memakai OAuth akun Google pribadi, lihat bagian 11.2 | [K] Drive, [A] metode |
| Penjadwal | Vercel Cron | Paket Hobby hanya mengizinkan jadwal sekali sehari, cukup untuk backup harian | [A] |
| PWA | File manifest bawaan Next.js (app/manifest.ts) | Ikon di layar utama, tanpa mode offline di MVP | [K] PWA |
| Layar tetap menyala | Screen Wake Lock API di browser | Untuk mode baca | [A] |
| OCR (tahap 2) | Kandidat: Google Cloud Vision (deteksi teks dokumen) atau Tesseract.js | Uji akurasi dengan 5 sampel tulisan ibu sebelum memilih | [A] |

### 9.4 Kuota gratis yang harus dipantau

Angka di bawah dicek per Oktober 2026 dan **bisa berubah**. Cek ulang di halaman resmi sebelum mulai.

| Layanan | Batas penting | Dampak ke proyek |
|---|---|---|
| Vercel Hobby | Khusus pemakaian pribadi non komersial, durasi fungsi maksimal 300 detik, cron hanya sekali sehari | Backup foto harus bertahap (hanya foto baru) agar selesai dalam satu eksekusi |
| Neon Free | 0,5 GB penyimpanan per proyek, komputasi tidur setelah 5 menit tanpa aktivitas, jendela pemulihan instan 6 jam | Permintaan pertama setelah lama tidak dipakai sedikit lebih lambat, backup sendiri tetap wajib |
| Cloudinary Free | 25 kredit per bulan, satu kredit setara 1 GB penyimpanan atau 1 GB bandwidth atau 1.000 transformasi | Kompres foto, batasi jenis transformasi yang dipakai |

