// uploadConfig.js
import multer from "multer";
import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import { Storage } from "@google-cloud/storage";
import cloudinary from "cloudinary";
// import { imgbbUploader } from "imgbb-uploader";
import dotenv from "dotenv";

dotenv.config();

const STORAGE_OPTION = process.env.STORAGE_OPTION || "local";

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|webm/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Unsupported file type!");
  }
};

let storage;
let upload;

switch (STORAGE_OPTION) {
  case "local":
    storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/assets");
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
      },
    });
    break;

  case "aws":
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    storage = multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
      },
    });
    break;

  case "google":
  case "cloudinary":
    // case 'imgbb':
    storage = multer.memoryStorage();
    break;

  default:
    throw new Error("Invalid storage option");
}

upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const googleStorage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handleFileUpload(req) {
  if (!req.file) {
    return null;
  }

  let fileUrl;

  switch (STORAGE_OPTION) {
    case "local":
      fileUrl = `${req.protocol}://${req.get("host")}/assets/${
        req.file.filename
      }`;
      break;
    case "aws":
      fileUrl = req.file.location;
      break;
    case "google":
      const bucket = googleStorage.bucket(process.env.GOOGLE_BUCKET_NAME);
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      await new Promise((resolve, reject) => {
        blobStream.on("finish", resolve);
        blobStream.on("error", reject);
        blobStream.end(req.file.buffer);
      });

      fileUrl = `https://storage.googleapis.com/${process.env.GOOGLE_BUCKET_NAME}/${blob.name}`;
      break;
    case "cloudinary":
      const result = await cloudinary.uploader.upload(req.file.buffer);
      fileUrl = result.secure_url;
      break;
  }

  return fileUrl;
}

export { upload, handleFileUpload };
