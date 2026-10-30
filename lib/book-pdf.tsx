// Pembuat PDF buku resep: A5 tegak, dibuat di browser pengguna (bukan di server). Dimuat lewat import dinamis
// dari halaman Buku supaya library PDF tidak membebani aplikasi utama. Rancangan: dev/dokumen/08-export-buku.md.
import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { BookData, BookSettings } from "@/lib/book-config";

/* eslint-disable jsx-a11y/alt-text -- Image milik @react-pdf bukan elemen <img> dan tidak punya atribut alt */

const MM = 72 / 25.4;
const PAGE_H = 210 * MM; // tinggi A5; nomor halaman memakai top karena bottom pada elemen fixed tidak dihitung benar saat halaman berlanjut
// shortcut: margin kiri-kanan disamakan (18 mm). Spesifikasi minta dalam 20 mm / luar 15 mm untuk cetak
// bolak-balik; ubah bila percetakan butuh, karena itu memerlukan margin berbeda di halaman ganjil dan genap.
const MARGIN = { top: 15 * MM, bottom: 18 * MM, side: 18 * MM };

let registeredBase = "";
function registerFonts(base: string) {
  if (registeredBase === base) return;
  Font.register({
    family: "Lora",
    fonts: [
      { src: `${base}/lora-400.woff` },
      { src: `${base}/lora-400-italic.woff`, fontStyle: "italic" },
      { src: `${base}/lora-700.woff`, fontWeight: 700 },
    ],
  });
  // Tanpa pemenggalan kata otomatis; aturan bawaan memotong kata bahasa Indonesia dengan janggal.
  Font.registerHyphenationCallback((word) => [word]);
  registeredBase = base;
}

function makeStyles(s: BookSettings) {
  const base = s.fontSize;
  const muted = "#6b6258";
  return StyleSheet.create({
    page: { fontFamily: "Lora", fontSize: base, lineHeight: 1.45, color: "#2b2622", paddingTop: MARGIN.top, paddingBottom: MARGIN.bottom, paddingHorizontal: MARGIN.side },
    pageNo: { position: "absolute", top: PAGE_H - 11 * MM, left: 0, right: 0, textAlign: "center", fontSize: base - 2, color: muted },
    runHead: { position: "absolute", top: 7 * MM, left: MARGIN.side, right: MARGIN.side, fontSize: base - 3, color: muted },
    cover: { fontFamily: "Lora", padding: 10 * MM, color: "#2b2622" },
    coverFrame: { flex: 1, borderWidth: 1.5, borderColor: s.accentColor, padding: 8 * MM, alignItems: "center", justifyContent: "space-between" },
    coverFamily: { fontSize: base, color: muted, textAlign: "center" },
    coverPhoto: { width: "100%", height: 62 * MM, objectFit: "cover" },
    coverTitle: { fontSize: base + 16, fontWeight: 700, color: s.accentColor, textAlign: "center", lineHeight: 1.2 },
    coverSub: { fontSize: base + 1, color: muted, textAlign: "center", marginTop: 6 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    dedPhoto: { width: 42 * MM, height: 42 * MM, objectFit: "cover", borderRadius: 21 * MM, marginBottom: 14 },
    dedText: { fontStyle: "italic", textAlign: "center", fontSize: base + 1, lineHeight: 1.6 },
    h1: { fontSize: base + 8, fontWeight: 700, color: s.accentColor, marginBottom: 14 },
    para: { marginBottom: 8, textAlign: "left" },
    tocGroup: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingBottom: 2, borderBottomWidth: 0.75, borderBottomColor: s.accentColor, fontWeight: 700 },
    tocRow: { flexDirection: "row", justifyContent: "space-between", marginLeft: 8, paddingVertical: 1.5 },
    tocTitle: { flex: 1, paddingRight: 8 },
    divider: { fontFamily: "Lora", padding: MARGIN.side, justifyContent: "center", alignItems: "center" },
    dividerName: { fontSize: base + 14, fontWeight: 700, color: s.accentColor, textAlign: "center" },
    dividerRule: { width: 30 * MM, height: 1.5, backgroundColor: s.accentColor, marginTop: 12 },
    cat: { fontSize: base - 3, color: s.accentColor, fontWeight: 700 },
    title: { fontSize: base + 8, fontWeight: 700, marginTop: 2, marginBottom: 4, lineHeight: 1.2 },
    meta: { fontSize: base - 1, color: muted },
    photo: { width: "100%", height: 62 * MM, objectFit: "cover", marginTop: 8 },
    h: { fontSize: base - 1, fontWeight: 700, color: s.accentColor, marginTop: 12, marginBottom: 4 },
    row: { flexDirection: "row", marginBottom: 2 },
    mark: { width: 14 },
    rowText: { flex: 1 },
    box: { marginTop: 12, padding: 8, backgroundColor: "#f6f1e9" },
    boxTitle: { fontSize: base - 2, fontWeight: 700, color: s.accentColor, marginBottom: 2 },
    italic: { fontStyle: "italic" },
  });
}

// Mencatat nomor halaman tempat elemen ini jatuh saat tata letak dihitung (dipakai render pertama untuk daftar isi).
const Mark = ({ id, onMark }: { id: string; onMark: (id: string, page: number) => void }) => (
  <Text style={{ fontSize: 0.1, height: 0 }} render={({ pageNumber }) => { onMark(id, pageNumber); return " "; }} />
);

function Book({ data, numbers, onMark }: { data: BookData; numbers: Record<string, number> | null; onMark: (id: string, page: number) => void }) {
  const { settings: s, groups } = data;
  const st = makeStyles(s);
  const pageNo = <Text fixed style={st.pageNo} render={({ pageNumber }) => `${pageNumber}`} />;
  const paragraphs = (text: string, style = st.para) => text.split(/\r?\n/).filter((l) => l.trim()).map((l, i) => <Text key={i} style={style}>{l}</Text>);
  const hasDedication = s.showDedication && (s.dedicationText || s.dedicationUrl);

  return (
    <Document title={s.title} author={s.familyName ?? undefined} language="id">
      <Page size="A5" style={st.cover}>
        <View style={[st.coverFrame, s.coverUrl ? {} : { justifyContent: "center" }]}>
          <Text style={[st.coverFamily, s.coverUrl ? {} : { marginBottom: 12 * MM }]}>{s.familyName ?? " "}</Text>
          {s.coverUrl ? <Image src={s.coverUrl} style={st.coverPhoto} /> : null}
          <View>
            <Text style={st.coverTitle}>{s.title}</Text>
            {s.subtitle && <Text style={st.coverSub}>{s.subtitle}</Text>}
          </View>
        </View>
      </Page>

      {hasDedication && (
        <Page size="A5" style={st.page}>
          <View style={st.center}>
            {s.dedicationUrl && <Image src={s.dedicationUrl} style={st.dedPhoto} />}
            {s.dedicationText && <Text style={st.dedText}>{s.dedicationText}</Text>}
          </View>
        </Page>
      )}

      {s.showForeword && s.foreword && (
        <Page size="A5" style={st.page} wrap>
          <Text style={st.h1}>Kata Pengantar</Text>
          {paragraphs(s.foreword)}
          {pageNo}
        </Page>
      )}

      {s.showToc && (
        <Page size="A5" style={st.page} wrap>
          <Text style={st.h1}>Daftar Isi</Text>
          {groups.map((g) => (
            <View key={g.id}>
              <View style={st.tocGroup} wrap={false}>
                <Text>{g.name}</Text>
                <Text>{numbers?.[`g-${g.id}`] ?? ""}</Text>
              </View>
              {g.recipes.map((r) => (
                <View key={r.id} style={st.tocRow} wrap={false}>
                  <Text style={st.tocTitle}>{r.title}</Text>
                  <Text>{numbers?.[r.id] ?? ""}</Text>
                </View>
              ))}
            </View>
          ))}
          {pageNo}
        </Page>
      )}

      {groups.flatMap((g) => [
        s.showDividers ? (
          <Page key={`d-${g.id}`} size="A5" style={st.divider}>
            <Mark id={`g-${g.id}`} onMark={onMark} />
            <Text style={st.dividerName}>{g.name}</Text>
            <View style={st.dividerRule} />
          </Page>
        ) : null,
        ...g.recipes.map((r, i) => (
          <Page key={r.id} size="A5" style={st.page} wrap>
            {/* Judul kecil di halaman lanjutan, supaya halaman kedua tetap jelas milik resep yang mana. */}
            <Text fixed style={st.runHead} render={({ subPageNumber }) => (subPageNumber > 1 ? r.title : " ")} />
            {!s.showDividers && i === 0 && <Mark id={`g-${g.id}`} onMark={onMark} />}
            <Mark id={r.id} onMark={onMark} />
            <Text style={st.cat}>{g.name}</Text>
            <Text style={st.title}>{r.title}</Text>
            {r.owner && <Text style={st.meta}>Resep dari: {r.owner}</Text>}
            {(r.servings || r.cookTime) && <Text style={st.meta}>{[r.servings && `Porsi: ${r.servings}`, r.cookTime].filter(Boolean).join(" · ")}</Text>}
            {r.photoUrl && <Image src={r.photoUrl} style={st.photo} />}
            {r.ingredients.length > 0 && (
              <View>
                <Text style={st.h}>Bahan</Text>
                {r.ingredients.map((t, n) => (
                  <View key={n} style={st.row} wrap={false}><Text style={st.mark}>•</Text><Text style={st.rowText}>{t}</Text></View>
                ))}
              </View>
            )}
            {r.steps.length > 0 && (
              <View>
                <Text style={st.h}>Cara membuat</Text>
                {r.steps.map((t, n) => (
                  <View key={n} style={st.row} wrap={false}><Text style={st.mark}>{n + 1}.</Text><Text style={st.rowText}>{t}</Text></View>
                ))}
              </View>
            )}
            {s.showStory && r.story && (
              <View style={st.box} wrap={false}><Text style={st.boxTitle}>Cerita resep ini</Text><Text>{r.story}</Text></View>
            )}
            {s.showMemory && r.memory && (
              <View style={st.box} wrap={false}><Text style={st.boxTitle}>Catatan</Text><Text style={st.italic}>{r.memory}</Text></View>
            )}
            {pageNo}
          </Page>
        )),
      ])}
    </Document>
  );
}

// Foto yang gagal dimuat dibuang supaya satu gambar rusak tidak menggagalkan seluruh buku.
async function dropBrokenImages(data: BookData): Promise<BookData> {
  const urls = new Set<string>();
  const { settings: s } = data;
  for (const u of [s.coverUrl, s.dedicationUrl, ...data.groups.flatMap((g) => g.recipes.map((r) => r.photoUrl))]) if (u) urls.add(u);
  const ok = new Map<string, boolean>();
  await Promise.all([...urls].map(async (u) => ok.set(u, await fetch(u).then((r) => r.ok).catch(() => false))));
  const keep = (u: string | null) => (u && ok.get(u) ? u : null);
  return {
    ...data,
    settings: { ...s, coverUrl: keep(s.coverUrl), dedicationUrl: keep(s.dedicationUrl) },
    groups: data.groups.map((g) => ({ ...g, recipes: g.recipes.map((r) => ({ ...r, photoUrl: keep(r.photoUrl) })) })),
  };
}

// Dua kali render: render pertama mencatat nomor halaman tiap resep, render kedua mengisi daftar isi dengan nomor itu.
// Daftar isi panjangnya tetap di kedua render, jadi nomor halaman tidak bergeser.
export async function buildBookPdf(data: BookData, opts: { fontBase: string; onProgress?: (message: string) => void }): Promise<Blob> {
  registerFonts(opts.fontBase);
  const clean = await dropBrokenImages(data);
  const found: Record<string, number> = {};
  const record = (id: string, page: number) => { found[id] = page; };
  opts.onProgress?.("Menyusun halaman buku...");
  await pdf(<Book data={clean} numbers={null} onMark={record} />).toBlob();
  opts.onProgress?.(clean.settings.showToc ? "Mengisi daftar isi..." : "Menyelesaikan buku...");
  return pdf(<Book data={clean} numbers={found} onMark={() => {}} />).toBlob();
}
