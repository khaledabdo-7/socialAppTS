import multer from "multer";
import { BadRequestError } from "../../common/response/error.response";

const storage = multer.memoryStorage();

const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only image files are allowed"));
  }
};

/**
 * Multer configuration specialized for profile avatars and cover images:
 * - 5MB maximum file size
 * - Image MIME types only
 */
export const profileUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: imageFileFilter,
});

/**
 * Multer configuration specialized for post media and photos:
 * - 15MB maximum file size
 * - Image MIME types only
 */
export const postUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
  fileFilter: imageFileFilter,
});

export const profileUploadMiddleware = profileUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

export const postUploadMiddleware = postUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "postImage", maxCount: 1 },
]);

export const extractFile = (req: any): Express.Multer.File | undefined => {
  if (req.file) return req.file;
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    return (
      files["image"]?.[0] ||
      files["avatar"]?.[0] ||
      files["cover"]?.[0] ||
      files["file"]?.[0] ||
      files["postImage"]?.[0]
    );
  }
  return undefined;
};
