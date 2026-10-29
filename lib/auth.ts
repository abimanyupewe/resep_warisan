import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

// Vercel mengisi VERCEL_URL (alamat deployment ini) dan VERCEL_PROJECT_PRODUCTION_URL otomatis. Keduanya dipercaya
// agar login tetap jalan di alamat preview dan alamat vercel.app, selain BETTER_AUTH_URL.
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map((host) => `https://${host}`);

export const auth = betterAuth({
  trustedOrigins: vercelOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Tidak ada pendaftaran publik; akun dibuat admin.
    disableSignUp: true,
  },
  // Sesi panjang (setahun) supaya ibu dan budhe jarang harus login ulang.
  session: { expiresIn: 60 * 60 * 24 * 365, updateAge: 60 * 60 * 24 * 7 },
  user: {
    additionalFields: {
      fontSize: { type: "string", required: false, defaultValue: "normal" },
    },
  },
  databaseHooks: {
    session: {
      create: {
        // Login berhasil = sesi baru. shortcut: login gagal belum dicatat.
        after: async (s) => {
          await audit(s.userId, "auth.login", "user", s.userId, { ip: s.ipAddress, userAgent: s.userAgent });
        },
      },
    },
  },
  plugins: [admin({ defaultRole: "anggota", adminRoles: ["admin"] }), nextCookies()],
});
