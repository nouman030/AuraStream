import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

//multer storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'video', // ⚠️ audio ke liye 'video' type use hota hai Cloudinary mein
    folder: 'music',
    allowed_formats: ['mp3', 'wav', 'ogg'],
  },
});

export const upload = multer({ storage });

export default cloudinary;