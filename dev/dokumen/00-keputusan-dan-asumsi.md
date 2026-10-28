# Dokumen Pengembangan: Platform Resep Warisan Keluarga

Versi 1.0, 28 Oktober 2026
Pengembang: Akhmad
Nama kerja aplikasi: **Dapur Uti** (usulan, boleh diganti)

**Penanda sumber di seluruh dokumen**

| Penanda | Arti |
|---|---|
| **[K]** | Keputusan dari Akhmad selama brainstorming |
| **[A]** | Asumsi atau rekomendasi Claude, boleh diubah |

---

## 0. Daftar Keputusan dan Asumsi

| No | Aspek | Isi | Sumber |
|---|---|---|---|
| 1 | Cakupan | Platform tertutup untuk satu keluarga | [K] |
| 2 | Pengguna input | Ibu, budhe, dan Akhmad (admin) | [K] |
| 3 | Perangkat utama | HP Android, desain mengutamakan layar HP | [K] |
| 4 | Cara input MVP | Ketik manual dan foto tulisan tangan sebagai lampiran | [K] |
| 5 | OCR | Ditunda ke tahap 2, hasilnya selalu berupa draf yang wajib dicek | [K] |
| 6 | Input suara | Memakai fitur ketik suara bawaan keyboard Android | [A] |
| 7 | Jumlah resep awal | 30 sampai 100 resep | [K] |
| 8 | Login | Email dan password, sesi panjang, admin bisa reset password | [K] login, [A] reset oleh admin dan sesi panjang |
| 9 | Pendaftaran akun | Tidak ada pendaftaran publik, akun dibuat oleh admin | [A] |
| 10 | Data wajib dan utama | Judul, kategori, bahan, langkah, foto masakan, foto tulisan asli, cerita asal, kenangan atau pesan uti, pemilik resep | [K] |
| 11 | Data opsional | Porsi, waktu masak, tingkat kesulitan, di bagian "Info tambahan" | [K] data, [A] penempatan |
| 12 | Format bahan dan langkah | Teks bebas, satu bahan atau satu langkah per baris | [K] bahan, [A] langkah |
| 13 | Hak edit | Semua anggota terdaftar boleh mengedit semua resep | [K] |
| 14 | Riwayat perubahan | Setiap simpan membuat versi, versi lama bisa dikembalikan | [A] |
| 15 | Hapus resep | Masuk tempat sampah dulu, bisa dipulihkan | [A] |
| 16 | Versi resep | Variasi dicatat sebagai resep terpisah dengan judul berbeda | [A] |
| 17 | Status kelengkapan | Penanda "perlu dicek" untuk resep dari ingatan yang belum pasti | [A] |
| 18 | Export | PDF ukuran A5, untuk dicetak di percetakan dan dibaca di HP | [K] |
| 19 | Isi buku | Pilih per kategori atau per pemilik resep | [K] |
| 20 | Halaman persembahan uti | Di awal buku | [A] |
| 21 | Bentuk aplikasi | Web app yang bisa dipasang ke layar utama (PWA) | [K] |
| 22 | Framework | Next.js untuk frontend dan backend | [K] |
| 23 | Hosting | Vercel paket Hobby (gratis) | [K] |
| 24 | Database | Neon Postgres paket gratis | [K] |
| 25 | Penyimpanan foto | Cloudinary paket gratis, foto dikompres sebelum diunggah | [K] Cloudinary, [A] kompresi |
| 26 | Backup | Google Drive, otomatis harian | [K] Google Drive, [A] jadwal dan isi |
| 27 | Pembuatan PDF | Di browser pengguna, bukan di server | [A] |
| 28 | Biaya | Harus gratis | [K] |
| 29 | Target MVP | 1 bulan, dikerjakan setiap hari | [K] |
| 30 | Konteks | Proyek pribadi, bukan tugas kuliah | [K] |
