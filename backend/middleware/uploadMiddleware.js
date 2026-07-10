import multer from 'multer';

// Use memory storage so we don't save temporary files to the disk
const storage = multer.memoryStorage();

// Validate file uploads
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // limit 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, DOCX, and TXT are allowed.'), false);
    }
  }
});
