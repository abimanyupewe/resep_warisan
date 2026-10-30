# Dapur Uti

Platform resep warisan keluarga: tempat mencatat, mencari, dan membaca resep turun-temurun, lalu mengubahnya menjadi buku resep berukuran A5 dalam bentuk PDF yang siap dicetak.

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![Neon Postgres](https://img.shields.io/badge/Neon-Postgres-4169E1?logo=postgresql&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better%20Auth-1.7-111111)
![Cloudinary](https://img.shields.io/badge/Cloudinary-foto-3448C5?logo=cloudinary&logoColor=white)
![OCR Gemini](https://img.shields.io/badge/OCR-Gemini%203.5%20Flash--Lite-8E75B2?logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Hobby-000000?logo=vercel&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-dapat%20dipasang-5A0FC8?logo=pwa&logoColor=white)

## Daftar Isi

1. [Deskripsi](#deskripsi)
2. [Latar Belakang](#latar-belakang)
3. [Masalah](#masalah)
4. [Masalah yang Diatasi](#masalah-yang-diatasi)
5. [Fitur](#fitur)
6. [Stack yang Digunakan](#stack-yang-digunakan)
7. [Struktur Folder](#struktur-folder)
8. [Model Data](#model-data)
9. [Cara Install](#cara-install)
10. [Variabel Lingkungan](#variabel-lingkungan)
11. [Perintah yang Tersedia](#perintah-yang-tersedia)
12. [Deploy ke Vercel](#deploy-ke-vercel)
13. [Pencadangan dan Pemulihan](#pencadangan-dan-pemulihan)
14. [Pemecahan Masalah](#pemecahan-masalah)
15. [Dokumentasi Pengembangan](#dokumentasi-pengembangan)
16. [Status dan Batasan](#status-dan-batasan)
17. [Lisensi](#lisensi)

## Deskripsi

Dapur Uti adalah aplikasi web untuk satu keluarga. Anggota keluarga dapat menulis resep (bahan, langkah, cerita di balik resep, dan catatan), melampirkan foto masakan atau foto catatan tulisan tangan, mengelompokkan resep menurut kategori dan pemilik resep, lalu mengunduh seluruh resep atau sebagian saja sebagai buku PDF A5 lengkap dengan sampul, kata pengantar, daftar isi, dan nomor halaman.

Aplikasi dirancang untuk pengguna yang tidak terbiasa dengan teknologi, terutama anggota keluarga yang sudah lanjut usia: huruf besar dengan tiga pilihan ukuran, tombol dengan area sentuh minimal 48 px, satu tugas per layar, dan seluruh teks antarmuka berbahasa Indonesia. Aplikasi berjalan optimal di Android dan dapat dipasang ke layar utama sebagai Progressive Web App (PWA).

Seluruh layanan yang dipakai berada pada paket gratis: Vercel Hobby, Neon Free, dan Cloudinary Free.

## Latar Belakang

Uti dikenal sangat pandai memasak. Resep-resepnya kini tersisa di ingatan anak dan menantunya, serta di catatan buku tulis yang rajin ditulis oleh ibu. Buku tulis bisa rusak, hilang, dan sulit dibagikan ke anggota keluarga yang lain. Selain itu belum ada satu tempat bersama tempat ibu, budhe, dan anggota keluarga lain dapat saling melengkapi resep beserta cerita di baliknya.

Keluarga ingin hasil akhirnya bukan sekadar data di aplikasi, melainkan buku fisik yang dapat dicetak dan disimpan turun-temurun. Dari kebutuhan itulah Dapur Uti dibuat: wadah untuk mengumpulkan resep, merawatnya bersama, dan membukukannya.

## Masalah

1. Resep keluarga hanya tersimpan di ingatan beberapa orang dan di buku tulis, sehingga rentan hilang.
2. Catatan di buku tulis sulit dibagikan, dicari, dan dilengkapi oleh anggota keluarga lain.
3. Tidak ada tempat bersama untuk menyimpan resep beserta cerita dan kenangan di baliknya.
4. Pengguna utama adalah orang tua yang tidak terbiasa dengan aplikasi, sehingga antarmuka umum terasa terlalu rumit atau terlalu kecil.
5. Mengubah kumpulan resep menjadi buku cetak yang rapi biasanya memerlukan keahlian desain dan perangkat lunak khusus.
6. Perubahan yang tidak sengaja (resep terhapus atau tertimpa) dapat menghilangkan data yang sulit ditulis ulang.

## Masalah yang Diatasi

| Masalah | Cara Dapur Uti mengatasinya |
|---|---|
| Resep hanya ada di ingatan dan buku tulis | Semua resep disimpan di database Postgres (Neon). Foto catatan tulisan tangan dapat dilampirkan pada resep, sehingga catatan asli ikut diarsipkan. |
| Sulit dibagikan dan dilengkapi bersama | Setiap anggota dapat mendaftar dan langsung mengubah semua resep. Halaman Jelajah membuat resep dapat dibaca siapa saja tanpa akun. |
| Resep sulit dicari | Pencarian menurut judul dan bahan, ditambah filter kategori, pemilik resep, dan status "perlu dicek". |
| Antarmuka rumit bagi lansia | Tiga ukuran huruf per akun, tombol besar, teks Indonesia sederhana, dan panduan tur singkat saat pertama masuk. |
| Sulit membuat buku cetak | Menu Buku menghasilkan PDF A5 langsung di browser, lengkap dengan sampul, persembahan, kata pengantar, daftar isi bernomor halaman, pembatas kategori, dan halaman resep. Admin mengatur isi serta tampilan templatenya. |
| Resep terhapus atau tertimpa | Setiap penyimpanan membuat versi yang dapat dipulihkan. Penghapusan memindahkan resep ke tempat sampah lebih dulu. |
| Data hilang saat terjadi kerusakan | Admin dapat mengekspor seluruh data ke satu berkas JSON, dan tersedia skrip pemulihan ke database kosong. |
| Biaya | Semua layanan memakai paket gratis, dan foto dikompres di browser sebelum diunggah agar kuota hemat. |

## Fitur

Anggota keluarga:

- Daftar sendiri di halaman `/daftar`. Akun langsung aktif tanpa persetujuan, dengan batas pendaftaran per hari.
- Menulis dan mengubah resep: judul, kategori, pemilik, porsi, waktu masak, tingkat kesulitan, bahan dan langkah (satu per baris), cerita resep, dan catatan.
- Membuat kategori atau pemilik resep baru langsung dari form tambah resep.
- Mengunggah foto masakan dan foto tulisan asli, dikompres di browser sebelum dikirim ke Cloudinary.
- Membaca resep dari foto tulisan tangan (OCR) di form tambah dan ubah resep, lewat kamera atau galeri. Hasilnya masuk ke kolom Bahan dan Langkah sebagai draf, dan judul serta kategori diisi bila masih kosong. Bahan yang terbagi dalam bagian (mis. "Adonan:") ditampilkan sebagai judul bagian. Pembacaan dibatasi per hari untuk seluruh aplikasi.
- Pencarian, filter, dan paginasi daftar resep, dengan filter yang dibuka dalam modal.
- Memilih resep yang sedang dimasak dan melihat riwayatnya.
- Mengatur ukuran huruf per akun dan memasang aplikasi ke layar utama HP.
- Mengunduh buku resep PDF (semua resep, per kategori, atau per pemilik).

Pengunjung tanpa akun:

- Landing page dengan statistik, resep terbaru, kategori, dan FAQ.
- Halaman Jelajah untuk membaca dan mencari resep yang sudah tampil di halaman umum (resep berstatus draf tidak ditampilkan).
- Unduh buku resep PDF dari resep yang tampil di halaman umum.

Admin:

- Ringkasan dengan grafik, serta pengelolaan resep, anggota, kategori, dan pemilik resep.
- Tempat sampah dengan pemulihan resep, dan log audit untuk tindakan penting.
- Impor resep dalam jumlah banyak dari teks terstruktur.
- Pengelolaan FAQ yang tampil di landing page.
- Pengelolaan template buku: judul, subjudul, nama keluarga, foto sampul, persembahan, kata pengantar, bagian yang dicetak, warna aksen, dan ukuran huruf, lengkap dengan pratinjau sebelum disimpan.
- Ekspor seluruh data sebagai berkas JSON.

## Stack yang Digunakan

| Lapisan | Teknologi | Badge |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | ![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?logo=nextdotjs&logoColor=white) |
| Antarmuka | React 19 | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) |
| Bahasa | TypeScript 5 | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| Gaya | Tailwind CSS 4 | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white) |
| Komponen | Base UI, class-variance-authority, lucide-react, tw-animate-css | ![Base UI](https://img.shields.io/badge/Base%20UI-1.9-111111) |
| Database | Neon Postgres (paket Free) | ![Neon](https://img.shields.io/badge/Neon-Postgres-4169E1?logo=postgresql&logoColor=white) |
| ORM | Prisma 7 dengan adapter Neon | ![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?logo=prisma&logoColor=white) |
| Autentikasi | Better Auth (email dan password, plugin admin) | ![Better Auth](https://img.shields.io/badge/Better%20Auth-1.7-111111) |
| Foto | Cloudinary (unggah bertanda tangan dari server) | ![Cloudinary](https://img.shields.io/badge/Cloudinary-foto-3448C5?logo=cloudinary&logoColor=white) |
| OCR | Gemini API (model vision, dipanggil dari server) | ![OCR Gemini](https://img.shields.io/badge/OCR-Gemini%203.5%20Flash--Lite-8E75B2?logo=googlegemini&logoColor=white) |
| PDF | @react-pdf/renderer, dijalankan di browser | ![react-pdf](https://img.shields.io/badge/react--pdf-4.9-E8452C) |
| Huruf buku | Lora (@fontsource/lora) | ![Lora](https://img.shields.io/badge/font-Lora-111111) |
| Grafik admin | Recharts 3 | ![Recharts](https://img.shields.io/badge/Recharts-3.8-22B5BF) |
| Panduan tur | driver.js | ![driver.js](https://img.shields.io/badge/driver.js-1.10-111111) |
| Hosting | Vercel (paket Hobby, region Singapura) | ![Vercel](https://img.shields.io/badge/Vercel-Hobby-000000?logo=vercel&logoColor=white) |
| Kualitas kode | ESLint 9 | ![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white) |
| Runtime | Node.js (dikembangkan dengan versi 24) | ![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white) |

Aplikasi ini adalah PWA: berkas manifest membuatnya dapat dipasang ke layar utama. Tidak ada service worker, sehingga halaman selalu diambil dari server dan tidak ada mode offline.

## Struktur Folder

```
resep_warisan/
├── app/                          Rute Next.js (App Router)
│   ├── (anggota)/                Panel anggota (wajib login)
│   │   ├── akun/                 Pengaturan akun dan ukuran huruf
│   │   ├── beranda/              Beranda: riwayat dan resep terbaru
│   │   ├── buku/                 Unduh buku resep PDF
│   │   ├── resep/                Daftar, detail, tambah, ubah, foto, dan sampah resep
│   │   └── riwayat/              Riwayat resep yang pernah dimasak
│   ├── (publik)/                 Halaman untuk pengunjung
│   │   ├── jelajah/              Daftar dan detail resep publik, serta jelajah/buku
│   │   └── page.tsx              Landing page
│   ├── admin/                    Panel admin
│   │   ├── anggota/              Pengelolaan akun anggota
│   │   ├── audit/                Log audit
│   │   ├── buku/                 Template dan pratinjau buku
│   │   ├── daftar/               Kategori dan pemilik resep
│   │   ├── faq/                  Pengelolaan FAQ
│   │   ├── resep/                Daftar resep dan impor massal
│   │   └── sampah/               Tempat sampah dan pemulihan
│   ├── api/                      Route Handler
│   │   ├── admin/                Ekspor data dan log audit
│   │   ├── auth/                 Endpoint Better Auth
│   │   ├── book/                 Data isi buku untuk pembuatan PDF
│   │   ├── categories/           Kategori
│   │   ├── ocr/                  Pembacaan foto tulisan tangan lewat Gemini
│   │   ├── people/               Pemilik resep
│   │   ├── photos/               Foto (tanda tangan unggah dan pendaftaran)
│   │   └── recipes/              Resep, versi, dan pemulihan
│   ├── daftar/                   Pendaftaran
│   ├── login/                    Masuk dan keluar
│   ├── globals.css               Gaya global dan token warna
│   ├── layout.tsx                Layout akar (font, metadata)
│   ├── manifest.ts               Manifest PWA
│   ├── icon.png                  Ikon tab browser
│   └── apple-icon.png            Ikon untuk iPhone
├── components/                   Komponen bersama
│   ├── ui/                       Komponen dasar (tombol, input, dialog, kartu, tabel, dan lain-lain)
│   ├── auth-shell.tsx            Kerangka halaman masuk dan daftar
│   ├── cloud-img.tsx             Gambar Cloudinary
│   └── site-footer.tsx           Footer
├── lib/                          Logika bersama
│   ├── auth.ts                   Konfigurasi Better Auth
│   ├── admin.ts, member.ts       Penjaga akses admin dan anggota
│   ├── book.ts                   Query data buku
│   ├── book-config.ts            Tipe dan konstanta buku (aman dipakai di klien)
│   ├── book-pdf.tsx              Pembuat PDF A5 (dimuat saat dibutuhkan)
│   ├── cloudinary.ts             URL gambar Cloudinary
│   ├── upload-photo.ts           Kompres dan unggah foto dari browser
│   ├── recipes.ts                Validasi dan versi resep
│   ├── recipe-import.ts          Penguraian impor resep
│   ├── prisma.ts                 Klien Prisma
│   └── audit.ts, public.ts, utils.ts, pending.ts
├── prisma/
│   ├── schema.prisma             Skema database
│   └── migrations/               Riwayat migrasi
├── scripts/                      Skrip yang dijalankan manual
│   ├── seed.ts                   Admin pertama, kategori, dan pemilik awal
│   ├── seed-demo.ts              Data contoh (khusus pengembangan)
│   ├── seed-faq.ts               FAQ contoh (khusus pengembangan)
│   ├── restore.ts                Pemulihan dari berkas ekspor JSON
│   ├── test-import.ts            Uji penguraian impor
│   └── test-book.tsx             Uji pembuatan PDF tanpa browser
├── public/
│   ├── fonts/                    Font Lora untuk PDF
│   └── icons/                    Ikon PWA
├── dev/dokumen/                  Dokumen spesifikasi produk (bahasa Indonesia)
├── generated/                    Klien Prisma hasil `prisma generate` (jangan diedit)
├── prisma.config.ts              Konfigurasi Prisma CLI
├── next.config.ts                Konfigurasi Next.js
├── vercel.json                   Konfigurasi Vercel (region)
├── .env.example                  Contoh variabel lingkungan
├── AGENTS.md, CLAUDE.md          Panduan untuk asisten pengodean
└── package.json
```

## Model Data

Skema lengkap ada di `prisma/schema.prisma`. Entitas utamanya:

| Entitas | Fungsi |
|---|---|
| User, Session, Account, Verification | Akun dan sesi, dikelola Better Auth. Peran: `admin` atau `anggota`. |
| Person | Pemilik resep (mis. Uti). Dipisah dari User karena pemilik tidak harus punya akun. |
| Category | Kategori resep, dengan urutan tampil. |
| Recipe | Resep: judul, bahan, langkah, cerita, catatan, status, dan penanda hapus lunak. |
| Photo | Foto masakan, tulisan asli, sampul, persembahan, atau tokoh. |
| RecipeRevision | Salinan isi resep pada setiap penyimpanan, untuk riwayat dan pemulihan. |
| BookProfile | Pengaturan template buku (satu baris). |
| Faq | Pertanyaan umum di landing page. |
| CookLog | Riwayat resep yang dipilih untuk dimasak. |
| AuditLog | Catatan tindakan penting. Setiap pembacaan OCR (`ocr.read`) juga dicatat di sini dan dipakai untuk menghitung batas harian. |

## Cara Install

Bagian ini menjelaskan pemasangan dari awal sampai aplikasi berjalan di komputer lokal. Ikuti urutannya, karena beberapa langkah bergantung pada langkah sebelumnya.

### 1. Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| Node.js | Dikembangkan dan diuji dengan Node.js 24. Versi LTS yang lebih baru dari 20 seharusnya cukup. Periksa dengan `node -v`. |
| npm | Terpasang bersama Node.js. Proyek memakai `package-lock.json`. |
| Git | Untuk mengambil kode. |
| Akun Neon | Database Postgres. Daftar di neon.tech (paket Free). |
| Akun Cloudinary | Penyimpanan foto. Daftar di cloudinary.com (paket Free). |
| API key Gemini | Opsional, hanya untuk fitur baca tulisan tangan (OCR). Buat di aistudio.google.com (Get API key). |
| Akun Vercel | Hanya untuk deploy. Tidak diperlukan untuk menjalankan di lokal. |

### 2. Ambil kode

```bash
git clone https://github.com/abimanyupewe/resep_warisan.git
cd resep_warisan
```

### 3. Siapkan database di Neon

1. Masuk ke Neon Console, buat proyek baru. Pilih region yang dekat dengan pengguna (proyek ini memakai Singapura).
2. Buka halaman Connect pada proyek tersebut, lalu salin **dua** connection string:
   - **Pooled connection**: nama host mengandung `-pooler`. Ini menjadi `DATABASE_URL`, dipakai aplikasi saat berjalan.
   - **Direct connection**: nama host tanpa `-pooler`. Ini menjadi `DIRECT_URL`, dipakai Prisma untuk migrasi dan `prisma generate`.
3. Pastikan keduanya memakai `sslmode=require`.

### 4. Siapkan akun Cloudinary

1. Buka Dashboard, lalu halaman API Keys.
2. Catat tiga nilai: Cloud name, API Key, dan API Secret.
3. Folder `dapur-uti` dibuat otomatis saat foto pertama diunggah. Tidak ada pengaturan lain yang diperlukan.

### 5. Buat berkas `.env`

Berkas ini **harus ada sebelum** `npm install`, karena `prisma.config.ts` membaca `DIRECT_URL` saat `prisma generate` dijalankan otomatis oleh `postinstall`.

```bash
cp .env.example .env
```

Isi minimal untuk menjalankan di lokal:

| Variabel | Cara mengisi |
|---|---|
| `DATABASE_URL` | Pooled connection string dari langkah 3 |
| `DIRECT_URL` | Direct connection string dari langkah 3 |
| `BETTER_AUTH_SECRET` | Hasil perintah `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name dari langkah 4 |
| `CLOUDINARY_API_KEY` | API Key dari langkah 4 |
| `CLOUDINARY_API_SECRET` | API Secret dari langkah 4 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Sama dengan `CLOUDINARY_CLOUD_NAME` |
| `ADMIN_EMAIL` | Email untuk akun admin pertama |
| `ADMIN_PASSWORD` | Password untuk akun admin pertama (gunakan yang kuat) |
| `GEMINI_API_KEY` | API key dari Google AI Studio. Boleh dikosongkan; tanpanya tombol baca tulisan tangan akan gagal. |
| `GEMINI_MODEL` | Nama model vision, mis. `gemini-3.5-flash-lite` |

Variabel Google Drive dan `CRON_SECRET` boleh dikosongkan; fiturnya belum aktif (lihat [Status dan Batasan](#status-dan-batasan)). Berkas `.env` sudah diabaikan oleh Git, jadi tidak akan ikut ter-commit. Jangan pernah membagikan isinya.

### 6. Pasang dependensi

```bash
npm install
```

Perintah ini juga menjalankan `prisma generate` secara otomatis dan membuat klien Prisma di folder `generated/`. Bila langkah ini gagal dengan pesan tentang `DIRECT_URL`, periksa kembali langkah 5.

### 7. Terapkan skema database

```bash
npx prisma migrate deploy
```

Perintah ini menerapkan semua migrasi di `prisma/migrations/` ke database Neon yang ditunjuk `DIRECT_URL`. Untuk database baru, semua tabel akan dibuat. Gunakan `migrate deploy`, bukan `migrate dev`, kecuali Anda sedang mengubah skema (lihat bagian [Perintah yang Tersedia](#perintah-yang-tersedia)).

### 8. Buat akun admin dan data awal

```bash
npx tsx --env-file=.env scripts/seed.ts
```

Skrip ini membuat akun admin dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD`, tujuh kategori awal (Makanan Utama, Lauk, Sayur, Sambal, Jajanan, Kue, Minuman), dan pemilik resep "Uti". Aman dijalankan berulang: bila admin sudah ada, passwordnya tidak diubah. `tsx` diunduh otomatis oleh `npx` saat pertama kali dipakai.

### 9. (Opsional) Isi data contoh untuk pengembangan

Hanya untuk database pengembangan, jangan dijalankan di produksi.

```bash
npx tsx --env-file=.env scripts/seed-demo.ts   # 2 anggota contoh (password: dapuruti123), pemilik, dan 8 resep
npx tsx --env-file=.env scripts/seed-faq.ts    # 6 pertanyaan FAQ contoh
```

### 10. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`. Untuk masuk sebagai admin, buka `/login` dan pakai `ADMIN_EMAIL` serta `ADMIN_PASSWORD`. Setelah login, admin dapat membuka panel di `/admin`, dan anggota biasa diarahkan ke `/beranda`.

### 11. Verifikasi pemasangan

```bash
npm run lint
npm run build
```

Keduanya harus selesai tanpa error. Proyek ini belum memiliki pengujian otomatis. Jangan menjalankan `npm run build` saat `npm run dev` sedang berjalan di folder yang sama, karena keduanya memakai folder `.next`.

## Variabel Lingkungan

Semua variabel didefinisikan di `.env.example`. Di Vercel, isi key yang sama pada Project Settings, Environment Variables.

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | Koneksi pooled Neon, dipakai aplikasi saat berjalan. |
| `DIRECT_URL` | Ya | Koneksi langsung Neon, dipakai `prisma migrate` dan `prisma generate`. Wajib juga di Vercel, karena `postinstall` membacanya; tanpanya build gagal. |
| `BETTER_AUTH_SECRET` | Ya | Rahasia penanda sesi. Buat dengan `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Ya | Alamat aplikasi tanpa garis miring di akhir. `http://localhost:3000` di lokal, alamat produksi di Vercel. |
| `CLOUDINARY_CLOUD_NAME` | Ya | Nama cloud Cloudinary. |
| `CLOUDINARY_API_KEY` | Ya | API Key Cloudinary. |
| `CLOUDINARY_API_SECRET` | Ya | API Secret Cloudinary. Hanya dipakai di server. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Ya | Sama dengan `CLOUDINARY_CLOUD_NAME`. Terkirim ke browser, jangan diberi nilai rahasia. |
| `ADMIN_EMAIL` | Untuk seed | Email admin pertama, dipakai `scripts/seed.ts`. |
| `ADMIN_PASSWORD` | Untuk seed | Password admin pertama, dipakai `scripts/seed.ts`. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_DRIVE_FOLDER_ID` | Belum dipakai | Disiapkan untuk pencadangan otomatis ke Google Drive. Belum dipakai oleh kode. |
| `CRON_SECRET` | Belum dipakai | Disiapkan untuk pekerjaan terjadwal Vercel Cron. Belum dipakai oleh kode. |
| `GEMINI_API_KEY` | Untuk OCR | API key Gemini, dibuat di aistudio.google.com. Hanya dipakai di server. |
| `GEMINI_MODEL` | Untuk OCR | Model vision yang dipakai. Bawaan di `.env.example`: `gemini-3.5-flash-lite`; ganti ke `gemini-3.6-flash` bila tulisan terlalu sulit dibaca. |
| `OCR_DAILY_LIMIT` | Tidak | Batas pembacaan OCR per 24 jam untuk seluruh aplikasi, menjaga kuota gratis. Bawaan 50. |

## Perintah yang Tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan di `http://localhost:3000`. |
| `npm run build` | Membuat build produksi. |
| `npm start` | Menjalankan hasil build produksi. |
| `npm run lint` | Menjalankan ESLint. |
| `npx prisma migrate deploy` | Menerapkan migrasi yang belum diterapkan. Aman untuk database yang sudah berisi data. |
| `npx prisma migrate dev --name <nama>` | Membuat dan menerapkan migrasi baru setelah mengubah `schema.prisma`. Hanya untuk database pengembangan. |
| `npx prisma migrate status` | Menampilkan migrasi mana yang sudah dan belum diterapkan. Hanya membaca. |
| `npx prisma generate` | Membuat ulang klien Prisma. |
| `npx tsx --env-file=.env scripts/<nama>.ts` | Menjalankan skrip di folder `scripts/`. |

Setiap kali skema Prisma berubah (`migrate` atau `generate`), **hentikan dan jalankan ulang `npm run dev`**. Klien Prisma di server dev disimpan di memori dan tidak diperbarui oleh hot reload.

Skrip uji PDF memerlukan langkah tambahan karena `@react-pdf/renderer` hanya berupa modul ESM. Petunjuknya ada di bagian kepala `scripts/test-book.tsx`.

## Deploy ke Vercel

1. Impor repositori ke Vercel. Framework terdeteksi sebagai Next.js. Region fungsi diatur ke `sin1` (Singapura) di `vercel.json`.
2. Isi semua variabel lingkungan dari tabel di atas, termasuk `DIRECT_URL`. Isi `BETTER_AUTH_URL` dengan alamat produksi, misalnya `https://namaproyek.vercel.app`, tanpa garis miring di akhir.
3. Gunakan database Neon yang **terpisah** dari database pengembangan untuk produksi.
4. Terapkan migrasi ke database produksi secara manual. Vercel hanya menjalankan `prisma generate` saat build, **tidak** menjalankan migrasi. Lakukan sebelum men-deploy kode yang mengubah skema:

   ```bash
   node --env-file=.env.prod node_modules/prisma/build/index.js migrate status
   node --env-file=.env.prod node_modules/prisma/build/index.js migrate deploy
   ```

   Berkas `.env.prod` berisi variabel produksi dan sudah diabaikan oleh Git. Opsi `--env-file` Node dipakai agar `DIRECT_URL` produksi terbaca, bukan yang ada di `.env`. Pastikan dulu host database yang tercetak adalah milik produksi, dan buat cadangan sebelum menerapkan.
5. Buat akun admin di produksi dengan `scripts/seed.ts` (isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` untuk perintah itu). Jangan menjalankan `seed-demo.ts` dan `seed-faq.ts` di produksi.
6. Setelah deploy, masuk sebagai admin lalu isi FAQ di `/admin/faq` dan atur template buku di `/admin/buku`.

Saat menggabungkan branch kerja ke `main` lewat Pull Request, pilih **Create a merge commit**, bukan Squash and merge. Penggabungan dengan squash memutus hubungan riwayat dan menimbulkan konflik pada penggabungan berikutnya.

## Pencadangan dan Pemulihan

Yang tersedia saat ini adalah pencadangan manual:

- **Ekspor:** admin mengunduh seluruh data sebagai satu berkas JSON lewat `GET /api/admin/export` (hanya untuk admin). Berkas memuat akun (tanpa hash password dan sesi), kategori, pemilik, resep termasuk yang di tempat sampah, foto, riwayat versi, pengaturan buku, dan log audit. Foto sendiri tetap tersimpan di Cloudinary; berkas JSON hanya menyimpan rujukannya.
- **Pemulihan:** ke database yang **kosong**, jalankan:

  ```bash
  npx tsx --env-file=.env scripts/restore.ts dapur-uti-2026-10-28.json
  ```

  Akun anggota dipulihkan tanpa password, sehingga admin harus mengatur ulang password mereka lewat panel admin.

Pencadangan otomatis harian ke Google Drive dirancang di `dev/dokumen/11-risiko-dan-backup.md` tetapi belum diimplementasikan.

## Pemecahan Masalah

| Gejala | Penyebab dan cara mengatasi |
|---|---|
| `npm install` gagal dengan pesan tentang `DIRECT_URL` | `.env` belum ada atau `DIRECT_URL` kosong. Buat `.env` dulu (langkah 5), lalu ulangi. |
| Pesan "No database host or connection string was set" | `DATABASE_URL` kosong atau server dev dijalankan sebelum `.env` diisi. Isi variabelnya lalu **restart** `npm run dev`. |
| Error `Cannot read properties of undefined (reading 'findMany')` untuk model baru | Klien Prisma di server dev masih versi lama. Jalankan `npx prisma generate`, lalu restart `npm run dev`. |
| Halaman memuat dan berkedip terus di mode dev | Status cache dev rusak, biasanya setelah pindah branch atau menjalankan `build` saat `dev` aktif. Tutup tab, hentikan server, jalankan `rm -rf .next`, lalu `npm run dev` dan buka di tab baru. |
| Halaman yang membaca database error `blocking-prerender` saat build | Halaman perlu `export const instant = false` dan `await connection()` (dari `next/server`) agar dibaca saat request, bukan saat build. |
| `migrate dev` meminta reset database | Berhenti. Pada database yang berisi data gunakan `migrate deploy`. |
| Foto gagal terunggah | Periksa nilai Cloudinary di `.env`. Pastikan `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` sama dengan `CLOUDINARY_CLOUD_NAME`, lalu restart server dev. |
| Baca tulisan tangan gagal atau "Layanan baca tulisan sedang bermasalah" | Periksa `GEMINI_API_KEY` dan `GEMINI_MODEL`, lalu restart server dev. Pesan "Pembacaan foto hari ini sudah penuh" berarti `OCR_DAILY_LIMIT` tercapai; tunggu 24 jam atau naikkan batasnya. Foto yang lebih dari 4 MB ditolak. |
| PDF buku tidak mau dibuat di HP | Buku dengan banyak foto berat bagi HP murah. Pilih per kategori, atau buat di laptop. |

## Dokumentasi Pengembangan

Spesifikasi produk ada di folder `dev/dokumen/`, ditulis dalam bahasa Indonesia, satu berkas per bab, dan diindeks di `dev/dokumen/README.md`. Keputusan di dalamnya ditandai **[K]** (diputuskan pengembang) atau **[A]** (asumsi yang dapat diubah).

| Bab | Isi |
|---|---|
| `01-ringkasan-produk.md` | Ringkasan, masalah, tujuan, dan di luar cakupan |
| `03-fitur.md` | Daftar fitur MVP dan lanjutan |
| `06-kebutuhan-dan-desain.md` | Kebutuhan, aksesibilitas lansia, font, warna, dan responsif |
| `07-rancangan-data.md` | Entitas dan rancangan database |
| `08-export-buku.md` | Struktur buku, A5, dan pendekatan pembuatan PDF |
| `09-tech-stack.md` | Perbandingan opsi dan pilihan stack |
| `11-risiko-dan-backup.md` | Risiko dan strategi pencadangan |

Proyek ini memakai Next.js 16 dan React 19 yang memiliki perubahan dibandingkan versi lama. Sebelum menulis kode Next.js, baca panduan yang sesuai di `node_modules/next/dist/docs/` (`01-app` untuk App Router), sebagaimana tercantum di `AGENTS.md`.

## Status dan Batasan

Proyek sudah berjalan di produksi. Hal-hal yang belum ada atau sengaja dibatasi:

- Pencadangan otomatis ke Google Drive dan Vercel Cron belum diimplementasikan (hanya variabel lingkungannya yang disiapkan).
- Belum ada pengujian otomatis. Verifikasi saat ini lewat `npm run lint`, `npm run build`, dan pemeriksaan manual.
- OCR tulisan tangan memakai Gemini API dan hasilnya hanya draf yang harus diperiksa. Akurasinya bergantung pada kejelasan tulisan, dan jumlah pembacaan dibatasi oleh `OCR_DAILY_LIMIT` serta kuota gratis Gemini.
- Foto tulisan asli belum ikut dicetak di buku PDF.
- Margin buku PDF dibuat simetris; margin sisi jilid yang berbeda untuk halaman ganjil dan genap belum diterapkan.
- Tidak ada mode offline karena tidak memakai service worker.
- Rancangan untuk satu keluarga. Akses multi-keluarga tidak termasuk cakupan.

## Lisensi

Belum ditentukan. Berkas `LICENSE` belum tersedia, sehingga hak cipta sepenuhnya dipegang pemilik repositori.
