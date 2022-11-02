import { Request, Response } from 'express';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});

export function uploadFromBuffer(req: Request, folder: string) {
  return new Promise((resolve, reject) => {
    const file = req.file as Express.Multer.File;
    if (!file.buffer) {
      reject('Buffer not found');
    }
    let cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
  });
}

export default cloudinary;
