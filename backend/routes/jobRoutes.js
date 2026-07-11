import express from 'express';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  applyToJob, 
  getJobApplicants, 
  updateApplicationStatus, 
  getMyApplications,
  getRecruiterJobs
} from '../controllers/jobController.js';
import { protect, recruiter } from '../middleware/authMiddleware.js';
import { upload, verifyFileSignature } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// General job endpoints
router.route('/')
  .post(protect, recruiter, createJob)
  .get(protect, getJobs);

// Student applications
router.get('/my-applications', protect, getMyApplications);

// Recruiter jobs list
router.get('/recruiter/my', protect, recruiter, getRecruiterJobs);

// Single job details
router.route('/:id')
  .get(protect, getJobById);

// Application actions
router.post('/:id/apply', protect, upload.single('resume'), verifyFileSignature, applyToJob);
router.get('/:id/applicants', protect, recruiter, getJobApplicants);
router.put('/applications/:id', protect, recruiter, updateApplicationStatus);

export default router;
