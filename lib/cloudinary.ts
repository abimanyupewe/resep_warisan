// URL gambar Cloudinary dengan transformasi di sisi Cloudinary (ukuran, kualitas, format otomatis).
const cloud = () => process.env.CLOUDINARY_CLOUD_NAME;

export const photoUrl = (publicId: string, transform: string) => `https://res.cloudinary.com/${cloud()}/image/upload/${transform}/${publicId}`;
export const thumb = (id: string) => photoUrl(id, "c_fill,w_600,h_400,q_auto,f_auto"); // kartu dan daftar
export const large = (id: string) => photoUrl(id, "c_limit,w_1200,q_auto,f_auto"); // halaman baca
export const original = (id: string) => photoUrl(id, "q_auto,f_auto"); // tulisan asli, ukuran penuh
