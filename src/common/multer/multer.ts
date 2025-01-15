import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

//====================================================================================================

const storage = multer.memoryStorage();

const fileFilter = (_: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/mkv"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only images (JPEG, PNG) and videos (MP4, MKV) are allowed."),
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadMiddleware = upload.single("file");

//====================================================================================================

const importStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const importFileFilter = (_: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["text/csv"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only CSV file is allowed."));
  }

  cb(null, true);
};

const importUpload = multer({
  storage: importStorage,
  fileFilter: importFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadImportMiddleware = importUpload.single("file");
