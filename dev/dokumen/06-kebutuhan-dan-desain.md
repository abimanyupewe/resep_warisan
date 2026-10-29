## 6. Kebutuhan Fungsional dan Non Fungsional

### 6.1 Kebutuhan fungsional

| ID | Kebutuhan |
|---|---|
| KF01 | Sistem menyediakan login email dan password tanpa pendaftaran publik |
| KF02 | Admin dapat membuat, menonaktifkan, dan mengatur ulang password akun anggota |
| KF03 | Pengguna dapat membuat resep melalui formulir bertahap, hanya judul yang wajib |
| KF04 | Sistem menyimpan draf resep setiap kali pengguna berpindah layar formulir |
| KF05 | Pengguna dapat mengunggah lebih dari satu foto per resep dengan jenis "masakan" atau "tulisan asli" |
| KF06 | Sistem mengompres foto di browser sebelum diunggah |
| KF07 | Semua anggota terdaftar dapat mengedit semua resep |
| KF08 | Sistem menyimpan salinan lengkap resep setiap kali disimpan dan dapat mengembalikan versi lama |
| KF09 | Resep yang dihapus masuk tempat sampah dan dapat dipulihkan oleh anggota mana pun |
| KF10 | Pengguna dapat mencari resep berdasarkan judul dan isi bahan |
| KF11 | Pengguna dapat menyaring resep berdasarkan kategori, pemilik resep, dan status kelengkapan |
| KF12 | Admin dapat mengelola daftar kategori dan pemilik resep beserta urutannya |
| KF13 | Pengguna dapat membuat PDF A5 berisi resep pilihan per kategori atau per pemilik |
| KF14 | Admin dapat mengubah judul buku, sampul, persembahan, dan kata pengantar |
| KF15 | Sistem menjalankan backup data dan foto baru ke Google Drive sekali sehari |
| KF16 | Dashboard admin menampilkan waktu dan status backup terakhir |
| KF17 | Mode baca menjaga layar tetap menyala selama halaman terbuka, jika browser mendukung |
| KF18 | Pengguna dapat memilih ukuran huruf dan pilihan itu diingat per akun |

### 6.2 Kebutuhan non fungsional

| ID | Kategori | Kebutuhan | Sumber |
|---|---|---|---|
| KNF01 | Biaya | Seluruh layanan berjalan di paket gratis | [K] |
| KNF02 | Kompatibilitas | Berjalan baik di Chrome Android versi terbaru dan browser laptop | [A] |
| KNF03 | Performa | Halaman beranda tampil dalam kurang dari 3 detik di koneksi 4G (target, bukan hasil ukur) | [A] |
| KNF04 | Keamanan | Seluruh akses lewat HTTPS, password disimpan dalam bentuk hash, semua halaman wajib login | [A] |
| KNF05 | Keamanan | Rahasia (kunci API, token) hanya disimpan di environment variable Vercel, tidak di kode | [A] |
| KNF06 | Ketahanan data | Tidak ada penghapusan permanen dari antarmuka anggota, hanya ke tempat sampah | [A] |
| KNF07 | Ketahanan data | Backup harian ke Google Drive, uji pemulihan setiap 3 bulan | [A] |
| KNF08 | Privasi | Aplikasi tidak terindeks mesin pencari | [A] |
| KNF09 | Pemeliharaan | Tersedia README berisi cara deploy, cara backup, dan cara memulihkan data | [A] |
| KNF10 | Kuota | Foto dikompres agar penyimpanan Cloudinary tetap jauh di bawah batas gratis | [A] |

### 6.3 Prinsip aksesibilitas untuk lansia

| No | Prinsip | Aturan konkret [A] |
|---|---|---|
| 1 | Ukuran huruf | Teks isi minimal 18 px, judul minimal 24 px, tersedia pilihan huruf lebih besar |
| 2 | Jenis huruf | Atkinson Hyperlegible (Google Fonts), dirancang khusus untuk keterbacaan |
| 3 | Kontras | Rasio kontras teks minimal 4,5:1 sesuai WCAG level AA, targetkan 7:1 untuk teks utama. Tidak memakai teks abu abu tipis |
| 4 | Ukuran tombol | Area sentuh minimal 48 x 48 px, jarak antar tombol cukup agar tidak salah tekan |
| 5 | Satu tugas per layar | Setiap layar punya satu tombol utama yang paling menonjol |
| 6 | Jumlah langkah | Fitur utama (tambah, cari, baca, buat buku) dapat dicapai maksimal 2 ketukan dari beranda |
| 7 | Label jelas | Ikon selalu disertai teks. Bahasa sehari hari: "Simpan", "Kembali", "Hapus", bukan istilah teknis |
| 8 | Tanpa gestur tersembunyi | Tidak ada fungsi yang hanya bisa diakses dengan geser, tekan lama, atau cubit |
| 9 | Aman dari salah tekan | Hapus selalu minta konfirmasi dan bisa dibatalkan dari tempat sampah |
| 10 | Posisi konsisten | Tombol "Kembali" dan tombol utama selalu di posisi yang sama di setiap layar |
| 11 | Pesan yang menenangkan | Pesan kesalahan menjelaskan apa yang terjadi dan apa yang harus dilakukan, misalnya "Internet terputus. Tulisan Ibu sudah tersimpan, coba tekan Simpan lagi." |
| 12 | Tidak ada batas waktu | Tidak ada layar yang hilang otomatis atau sesi yang cepat habis |

### 6.4 Panduan tampilan (tema clean flat minimalis)

**Gaya visual** [K]: clean, flat, minimalis. Aturan turunannya [A]:
1. Tanpa gradasi, tanpa bayangan, tanpa efek kaca. Pemisah antar elemen cukup garis tipis 1 px warna `#E7E2DA`.
2. Sudut membulat lembut [K], tidak ekstrem: 8 px untuk kartu dan bingkai foto, 6 px untuk tombol, kotak input, dan tombol filter kategori, 4 px untuk label kecil seperti "Perlu dicek". Tidak memakai bentuk kapsul (pill) maupun lingkaran penuh, kecuali foto profil.
3. Jarak memakai kelipatan 8 px (8, 16, 24, 32).
4. Hanya satu tombol berwarna terakota per layar, yaitu aksi utama. Tombol lain berlatar putih dengan garis tepi.
5. Hanya mode terang di MVP. Mode gelap ditunda karena menambah kerja dan jarang dibutuhkan pengguna lansia.

**Huruf** [A]

| Pemakaian | Font | Ukuran | Alasan |
|---|---|---|---|
| Seluruh antarmuka dan isi resep | Atkinson Hyperlegible Next | Isi 18 px, label 15 px | Dirancang Braille Institute untuk keterbacaan, huruf mirip seperti I, l, dan 1 mudah dibedakan |
| Judul resep dan judul aplikasi | Lora | 20 sampai 28 px | Serif hangat yang memberi kesan buku resep, sama dengan font di PDF sehingga aplikasi dan buku terasa satu keluarga |

Kedua font tersedia di Google Fonts dan dimuat lewat `next/font/google` agar tidak ada pergeseran tata letak saat halaman dibuka. Alternatif jika ingin tampilan lebih modern: Plus Jakarta Sans untuk antarmuka, dengan konsekuensi keterbacaan sedikit di bawah Atkinson.

**Warna** [A]

| Token | Hex | Pemakaian | Kontras |
|---|---|---|---|
| primary | `#A0472A` | Tombol utama, menu aktif, tautan | Teks putih di atasnya sekitar 6,1:1 |
| primary-soft | `#F5E6DF` | Latar pilihan yang aktif, sorotan lembut | |
| background | `#FAF8F5` | Latar halaman | |
| surface | `#FFFFFF` | Kartu dan kotak input | |
| border | `#E7E2DA` | Garis tepi dan pemisah | |
| text | `#1F1B16` | Teks utama | Di atas latar halaman jauh di atas 7:1 |
| text-muted | `#5C544A` | Teks pendukung | Di atas latar halaman sekitar 7:1 |
| success | `#2E6B3F` | Status lengkap, pesan berhasil | Teks putih sekitar 6,4:1 |
| warning-bg dan warning-text | `#FFF4D6` dan `#8A5A00` | Penanda "Perlu dicek" | Sekitar 5,4:1 |
| danger | `#B3261E` | Hapus dan pesan kesalahan | Teks putih sekitar 6,5:1 |

Angka kontras di atas hasil perhitungan rumus WCAG. Tetap cek ulang dengan alat pemeriksa kontras setelah diterapkan.

**Responsif, mobile first** [K responsif, A rincian]

| Lebar layar | Tata letak |
|---|---|
| Di bawah 640 px (HP) | Satu kolom, navigasi bawah berisi 4 menu berlabel: Beranda, Tambah, Buku, Akun |
| 640 sampai 1023 px (tablet) | Daftar resep dua kolom, navigasi bawah tetap |
| 1024 px ke atas (laptop) | Navigasi pindah ke bilah atas, daftar resep tiga kolom, halaman baca dan formulir dibatasi lebar maksimal 680 px di tengah agar baris teks tidak terlalu panjang |

Aturan responsif tambahan: area sentuh tetap minimal 48 px di semua ukuran, tidak ada tabel yang perlu digeser ke samping di HP, dan kotak input memakai ukuran huruf minimal 16 px agar browser HP tidak memperbesar halaman otomatis saat kotak disentuh.

