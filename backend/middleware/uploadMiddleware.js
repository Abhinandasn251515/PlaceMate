import multer from 'multer';

// Use memory storage so we don't save temporary files to the disk
const storage = multer.memoryStorage();

// Validate file uploads
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit resume upload size to 5MB (plenty for documents)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, DOCX, and TXT are allowed.'), false);
    }
  }
});

// 100000 IQ File Content Verification (Protects against Content-Type spoofing / security exploits)
export const verifyFileSignature = (req, file, next) => {
  // If no file was uploaded, proceed (custom resumes are optional; candidate can use profile default)
  if (!req.file) return next();

  const buffer = req.file.buffer;
  if (!buffer || buffer.length < 4) {
    return next(new Error('Uploaded file is corrupted or empty.'));
  }

  // Convert first 4 bytes to hex representation
  const hexSignature = buffer.toString('hex', 0, 4).toLowerCase();

  // Common document signatures (Magic Numbers)
  const isPdf = hexSignature === '25504446'; // %PDF
  const isDocx = hexSignature === '504b0304'; // PK.. (ZIP structure of DOCX)
  
  // Plaintxt signature checks (Verify characters are standard printable ASCII/UTF-8 bytes)
  const isTxt = buffer.slice(0, 100).every(byte => 
    (byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte === 9
  );

  if (isPdf || isDocx || isTxt) {
    next();
  } else {
    next(new Error('Security Verification Failed: The file contents do not match its declared type. Only genuine PDF, DOCX, and TXT files are allowed.'));
  }
};
