import { createHash } from "node:crypto";
import { currentUser, unauthorized } from "@/lib/recipes";

const PHOTO_FOLDER = "dapur-uti";

// Tanda tangan unggahan langsung dari browser ke Cloudinary; secret tidak pernah keluar dari server.
export async function POST() {
  if (!(await currentUser())) return unauthorized();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${PHOTO_FOLDER}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
  return Response.json({
    signature,
    timestamp,
    folder: PHOTO_FOLDER,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
