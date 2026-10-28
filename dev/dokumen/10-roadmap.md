## 10. Roadmap Pengembangan

Target MVP: 1 bulan, dikerjakan setiap hari [K].

| Minggu | Fokus | Hasil yang harus jadi | Definisi selesai |
|---|---|---|---|
| 1 | Fondasi | Proyek Next.js ter-deploy di Vercel, database Neon terhubung, skema tabel dibuat, login dan dashboard admin untuk membuat akun dan reset password, tata letak dasar dengan aturan aksesibilitas (huruf, tombol, warna) | Admin bisa membuat akun ibu, ibu bisa login dari HP |
| 2 | Resep | Formulir tambah resep 6 layar dengan simpan draf, unggah foto ke Cloudinary dengan kompresi, mode baca, edit resep, daftar "Belum selesai" | **Uji pakai pertama**: ibu memasukkan 3 resep sendiri, catat semua kebingungannya |
| 3 | Menemukan dan menjaga | Pencarian, filter kategori dan pemilik, kelola kategori dan pemilik resep, riwayat perubahan dan kembalikan versi, tempat sampah, status "Perlu dicek", perbaikan dari hasil uji minggu 2 | Budhe bisa menemukan resep dalam 2 ketukan, resep yang salah edit bisa dikembalikan |
| 4 | Buku dan backup | Pengaturan buku, export PDF A5 dengan daftar isi, backup harian ke Google Drive, status backup di dashboard, README cara memulihkan data, PWA manifest | Satu PDF A5 berisi minimal 10 resep berhasil dibuat, backup pertama berhasil, **uji pemulihan** ke cabang database Neon berhasil |

**Tahap 2 (bulan ke 2)** [A]
1. Memasukkan seluruh 30 sampai 100 resep dari buku tulis bersama ibu.
2. OCR sebagai pembantu input (L01), diawali uji akurasi dengan sampel tulisan ibu.
3. Input cepat admin (L02).
4. Cetak satu eksemplar buku uji di percetakan, perbaiki tata letak.

**Tahap 3 (setelah buku pertama tercetak)** [A]
1. Rekaman suara cerita (L04).
2. Tautan baca untuk keluarga besar (L05).
3. Catatan percobaan resep (L06) dan baca tanpa internet (L07).

Saran ritme kerja harian: akhiri setiap hari dengan deploy ke Vercel, sehingga ibu selalu bisa mencoba versi terbaru dan masalah ketahuan lebih awal.

