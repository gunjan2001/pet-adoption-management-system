import { createHash } from 'crypto';
import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary.config';
import db from '../config/db';
import { media } from '../db/schema';

// Upload handler
const uploadHandler = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // --- Read buffer & generate SHA-256 checksum ---
  const buffer = file.buffer;
  const checksum = createHash('sha256').update(buffer).digest('hex');

  // --- Upload to Cloudinary using checksum as the key ---
  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: checksum,   // checksum is the storage key
            folder: 'media',
            overwrite: false,      // skip re-upload if same file already exists
            resource_type: 'auto',
          },
          (error: unknown, result: any) => {
            if (error || !result) return reject(error);
            console.log("resolve",resolve);
            
            resolve(result);
          }
        )
        .on('error', (err) => reject(err))
        .end(buffer);
    }
  );

  let savedData = await db.insert(media).values({ checksum }).returning({ id: media.id }).execute();

  res.status(201)
    .json({ 
      message: 'File uploaded successfully', 
      data: { url: uploadResult.secure_url, mediaId: savedData[0].id } 
    });
};

export {
  uploadHandler
};

