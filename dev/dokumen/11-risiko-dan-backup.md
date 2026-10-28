## 11. Risiko dan Mitigasi

### 11.1 Daftar risiko

| No | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| 1 | Data resep hilang karena layanan bermasalah atau akun terhapus | Sangat tinggi | Rendah | Backup harian ke Google Drive, PDF lengkap bulanan, uji pemulihan tiga bulanan (lihat 11.2) |
| 2 | Resep berubah atau terhapus karena salah tekan | Tinggi | Sedang | Riwayat perubahan, tempat sampah, konfirmasi sebelum hapus |
| 3 | Ibu atau budhe kesulitan memakai aplikasi | Tinggi | Sedang | Uji pakai di minggu 2, Akhmad mendampingi sesi input pertama, perbaiki berdasarkan kebingungan nyata |
| 4 | Kuota Cloudinary habis karena foto besar | Sedang | Rendah | Kompresi di browser, pantau dashboard Cloudinary bulanan |
| 5 | Kuota atau kebijakan paket gratis berubah | Sedang | Sedang | Cek halaman harga setiap 3 bulan, backup memastikan data bisa dipindah ke layanan lain |
| 6 | Token Google Drive kedaluwarsa sehingga backup diam diam gagal | Tinggi | Sedang | Status backup tampil di dashboard, OAuth app di Google Cloud diset ke status "In production" (lihat 11.2), cek status backup mingguan |
| 7 | PDF gagal dibuat di HP karena kehabisan memori | Sedang | Sedang | Export per kategori, buat buku lengkap dari laptop |
| 8 | Takaran resep dari ingatan tidak akurat | Sedang | Tinggi | Status "Perlu dicek", kolom catatan, uji masak sebelum resep ditandai lengkap |
| 9 | Akhmad satu satunya orang yang paham sistem | Tinggi | Sedang | README lengkap: cara deploy, isi environment variable, cara memulihkan backup |
| 10 | Foto keluarga bisa diakses jika tautannya tersebar | Rendah | Rendah | Tautan Cloudinary memakai ID acak yang sulit ditebak, halaman aplikasi wajib login, aplikasi tidak diindeks mesin pencari |
| 11 | Target 1 bulan meleset | Sedang | Sedang | Fitur berprioritas Penting boleh digeser ke tahap 2, fitur Wajib tidak boleh |

### 11.2 Strategi backup data resep keluarga [A]

Prinsip: **data tidak boleh hanya ada di satu tempat, dan backup yang belum pernah diuji dipulihkan dianggap belum ada.**

**Lapis 1: Backup otomatis harian**
1. Vercel Cron memanggil endpoint backup sekali sehari, diamankan dengan token rahasia.
2. Endpoint mengekspor seluruh tabel (resep, riwayat, kategori, pemilik, foto, pengaturan buku) menjadi satu file JSON bertanggal, lalu mengunggahnya ke folder Google Drive.
3. Endpoint mengunduh foto asli yang `backed_up_at`-nya masih kosong dari Cloudinary, mengunggahnya ke subfolder foto di Google Drive, lalu mengisi `backed_up_at`. Hanya foto baru yang diproses agar selesai dalam batas waktu fungsi.
4. Hasil dicatat di BACKUP_LOG dan ditampilkan di dashboard admin.
5. Retensi: simpan 30 file backup harian terakhir dan satu file per bulan untuk seterusnya.

**Catatan penting autentikasi Google Drive**
1. **Jangan memakai service account** untuk Google Drive pribadi. Service account tidak punya kuota penyimpanan sendiri, sehingga unggahan ke Drive pribadi akan gagal.
2. Pakai **OAuth 2.0 dengan refresh token** milik akun Google Akhmad, dengan cakupan akses `drive.file` (aplikasi hanya bisa mengakses file yang dibuatnya sendiri).
3. Ubah status publikasi OAuth app di Google Cloud Console dari "Testing" ke "In production". Refresh token untuk app berstatus Testing kedaluwarsa dalam 7 hari, yang akan membuat backup berhenti tanpa disadari.

**Lapis 2: PDF lengkap bulanan**
Setiap awal bulan, admin membuat PDF buku lengkap dan menyimpannya ke folder Google Drive yang sama. PDF bisa dibaca siapa pun tanpa aplikasi, sehingga resep tetap selamat bahkan jika seluruh sistem tidak bisa dipulihkan.

**Lapis 3: Uji pemulihan tiga bulanan**
1. Buat cabang (branch) baru di Neon.
2. Impor file JSON backup terbaru ke cabang tersebut.
3. Jalankan aplikasi lokal yang terhubung ke cabang itu, cek beberapa resep dan fotonya.
4. Catat hasilnya di README, lalu hapus cabang uji.

**Tambahan:** buku tulis asli ibu dan catatan tangan uti tetap disimpan secara fisik. Aplikasi ini cadangan dan pelengkap, bukan pengganti benda kenangannya.

