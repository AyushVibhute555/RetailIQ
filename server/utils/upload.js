import multer from "multer";

// 🛠️ THE FIX: Keep the file in memory (RAM) instead of the hard drive.
// This generates the 'req.file.buffer' that Firebase needs for the upload.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    // Keep your excellent security check!
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});