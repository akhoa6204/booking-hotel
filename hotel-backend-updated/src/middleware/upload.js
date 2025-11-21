import multer from "multer";
import fs from "fs";
import path from "path";

const BASE_DIR = "uploads";

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const IMAGE_FILTER = (_, file, cb) =>
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Only image files allowed"), false);

const storageFor = (subdir) =>
  multer.diskStorage({
    destination: (_, __, cb) => {
      const dir = path.join(BASE_DIR, subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

/** Factory: tạo uploader cho từng loại */
export const uploadFor = (type, { field = "images", max = 10 } = {}) => {
  const storage = storageFor(type); // "hotel" | "room" | "review"
  return multer({
    storage,
    fileFilter: IMAGE_FILTER,
    limits: { fileSize: 5 * 1024 * 1024 },
  }).array(field, max);
};

/** Một số preset tiện dụng */
export const uploadHotelImages = uploadFor("hotel", {
  field: "images",
  max: 10,
});
export const uploadRoomImages = uploadFor("room", { field: "images", max: 10 });
export const uploadRoomTypeImages = uploadFor("room-type", { field: "images", max: 10 });

/** Middleware bắt lỗi Multer gọn */
export const handleUploadError = (err, _req, res, next) => {
  if (!err) return next();
  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ success: false, error: "File too large" });
  return res
    .status(400)
    .json({ success: false, error: err.message || "Upload error" });
};
