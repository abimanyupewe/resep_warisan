// Gambar Cloudinary sudah dioptimalkan lewat URL-nya, jadi next/image tidak diperlukan.
export function CloudImg({ alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img loading="lazy" decoding="async" alt={alt} {...rest} />;
}
