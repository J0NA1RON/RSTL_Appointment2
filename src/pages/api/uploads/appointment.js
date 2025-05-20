import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    const uploadDir = path.join(process.cwd(), 'public/uploads/appointments');
    await fs.mkdir(uploadDir, { recursive: true });
    const form = new IncomingForm({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      const fileArr = Array.isArray(files.file) ? files.file : [files.file];
      const fileUrls = fileArr.filter(Boolean).map(file => `/uploads/appointments/${path.basename(file.filepath || file.path)}`);
      return res.status(200).json({ success: true, files: fileUrls });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 