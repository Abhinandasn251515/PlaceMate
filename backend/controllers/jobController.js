import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Helper to stream file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'raw', 
        public_id: `resumes/${Date.now()}-${originalName.replace(/\.[^/.]+$/, "")}` 
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// @desc    Create new Job posting
// @route   POST /api/jobs
// @access  Private/Recruiter
export const createJob = async (req, res) => {
  const { title, company, description, requirements, ctc, location } = req.body;

  try {
    const job = await Job.create({
      title,
      company,
      description,
      requirements,
      ctc,
      location,
      postedBy: req.user._id
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all Job postings
// @route   GET /api/jobs
// @access  Private
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('postedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get Job by ID
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Apply to a Job
// @route   POST /api/jobs/:id/apply
// @access  Private/Student
export const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      jobId: req.params.id,
      studentId: req.user._id
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    let resumeUrl = req.user.resumeUrl || '';

    // If a new file is uploaded, stream it to Cloudinary
    if (req.file) {
      try {
        resumeUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        
        // Update user profile with latest resume
        await User.findByIdAndUpdate(req.user._id, { resumeUrl });
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ message: `Resume upload failed: ${uploadErr.message}` });
      }
    }

    if (!resumeUrl) {
      return res.status(400).json({ message: 'Please upload a resume or complete your profile first.' });
    }

    // Capture ATS score from profile (if evaluated) or use default fallback
    const student = await User.findById(req.user._id);
    const atsScore = student.progress?.resume || Math.floor(Math.random() * 25) + 60; // 60-85 fallback
    const interviewScore = student.progress?.mockTest || Math.floor(Math.random() * 20) + 65; // 65-85 fallback

    const application = await Application.create({
      jobId: req.params.id,
      studentId: req.user._id,
      resumeUrl,
      atsScore,
      interviewScore,
      status: 'Applied'
    });

    // Update student registered drives
    if (!student.registeredDrives.includes(job.company)) {
      student.registeredDrives.push(job.company);
      await student.save();
    }

    res.status(201).json({
      message: 'Application submitted successfully!',
      application
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all applications for a specific job (Recruiter view)
// @route   GET /api/jobs/:id/applicants
// @access  Private/Recruiter
export const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Verify ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job' });
    }

    const applicants = await Application.find({ jobId: req.params.id })
      .populate('studentId', 'name email level progress')
      .sort({ atsScore: -1 }); // Rank by ATS score by default

    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update Application Status (Recruiter action)
// @route   PUT /api/jobs/applications/:id
// @access  Private/Recruiter
export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  if (!['Applied', 'Under Review', 'Shortlisted', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid application status' });
  }

  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authority
    if (application.jobId.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this application' });
    }

    application.status = status;
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all applications by the currently logged-in student
// @route   GET /api/jobs/applications/my
// @access  Private/Student
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('jobId', 'title company location ctc');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get recruiter's posted jobs
// @route   GET /api/jobs/recruiter/my
// @access  Private/Recruiter
export const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
