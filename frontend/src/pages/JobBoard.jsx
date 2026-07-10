import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getJobs, applyToJob, getMyApplications } from '../api/backend';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Search, 
  Building, 
  Upload, 
  FileCheck, 
  RefreshCw, 
  Calendar,
  CheckCircle,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

const JobBoard = () => {
  const { user } = useContext(AuthContext);
  
  // Data States
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);

  const loadJobsData = async () => {
    try {
      setLoading(true);
      const jobsList = await getJobs();
      setJobs(jobsList);
      
      if (jobsList.length > 0) {
        setSelectedJob(jobsList[0]);
      }

      if (user && user.role === 'student') {
        const apps = await getMyApplications();
        setMyApplications(apps);
      }
    } catch (err) {
      console.error('Failed to load job listings:', err.message);
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsData();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplying(true);
    try {
      // Send file object if uploaded, otherwise server applies using profile's default resume
      await applyToJob(selectedJob._id, resumeFile);
      toast.success(`Successfully applied to ${selectedJob.company}!`);
      
      // Reload applications list
      const apps = await getMyApplications();
      setMyApplications(apps);
      setResumeFile(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Application submission failed.';
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      toast.info(`Selected file: ${file.name}`);
    }
  };

  // Filter jobs based on queries
  const filteredJobs = jobs.filter(job => 
    (job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
     job.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (job.location.toLowerCase().includes(locationQuery.toLowerCase()))
  );

  const hasApplied = (jobId) => {
    return myApplications.some(app => app.jobId?._id === jobId || app.jobId === jobId);
  };

  const getApplicationStatus = (jobId) => {
    const app = myApplications.find(app => app.jobId?._id === jobId || app.jobId === jobId);
    return app ? app.status : null;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Header Search Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3 shrink-0">
        <div className="flex-1 w-full flex items-center gap-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <Search className="text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by job title, company, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-xs font-semibold"
          />
        </div>

        <div className="w-full md:w-64 flex items-center gap-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <MapPin className="text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Location, e.g. Remote"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full py-3 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-xs font-semibold"
          />
        </div>

        <button 
          onClick={loadJobsData}
          className="w-full md:w-auto px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs tracking-wider transition-all border-none cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
        >
          Find Jobs
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 py-20 font-semibold text-xs">
          <RefreshCw className="animate-spin mr-2" size={16} /> Loading job portal...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-10 shadow-sm text-center">
          <Briefcase size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">No active postings</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">No jobs match your search keywords or location criteria. Try refining your filters.</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 overflow-hidden min-h-0">
          {/* Left: Job Cards List */}
          <div className="md:col-span-2 overflow-y-auto space-y-3 pr-1">
            {filteredJobs.map(job => {
              const selected = selectedJob && selectedJob._id === job._id;
              const applied = hasApplied(job._id);
              const status = getApplicationStatus(job._id);

              return (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 border rounded-3xl cursor-pointer transition-all relative flex flex-col justify-between ${
                    selected
                      ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-white leading-snug">{job.title}</h4>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black mt-0.5 flex items-center gap-1">
                          <Building size={11} /> {job.company}
                        </p>
                      </div>

                      {applied && (
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md border shrink-0 ${
                          status === 'Shortlisted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-100 dark:border-emerald-900/30'
                            : status === 'Rejected'
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-100 dark:border-red-900/30'
                            : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border-indigo-100 dark:border-indigo-900/30'
                        }`}>
                          {status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={10} /> {job.ctc}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Job Specifications Detail View */}
          <div className="md:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm overflow-y-auto flex flex-col justify-between">
            {selectedJob && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Title block */}
                  <div className="border-b border-slate-100 dark:border-slate-750 pb-4">
                    <h2 className="text-lg font-black text-slate-850 dark:text-white leading-snug">{selectedJob.title}</h2>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-1">
                        <Building size={14} /> {selectedJob.company}
                      </span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {selectedJob.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={13} /> {selectedJob.ctc}</span>
                    </div>
                  </div>

                  {/* Desc */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Job Description</h3>
                    <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Requirements</h3>
                    <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {selectedJob.requirements}
                    </p>
                  </div>
                </div>

                {/* Apply Panel */}
                <div className="border-t border-slate-100 dark:border-slate-750 pt-5 mt-6 shrink-0">
                  {hasApplied(selectedJob._id) ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold justify-center">
                      <CheckCircle size={16} /> 
                      You have already applied. Application Status: **{getApplicationStatus(selectedJob._id)}**
                    </div>
                  ) : user?.role === 'recruiter' ? (
                    <div className="text-center text-xs text-slate-400 font-bold py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      Recruiters cannot apply to jobs.
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        {/* Custom Resume Uploader */}
                        <div className="w-full flex items-center justify-between px-4 py-3 border border-dashed border-slate-300 dark:border-slate-650 hover:border-indigo-400 rounded-2xl transition-all relative">
                          <input 
                            type="file" 
                            id="file-apply"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {resumeFile ? <FileText className="text-indigo-500 animate-bounce" size={16} /> : <Upload size={16} />}
                            <span className="truncate max-w-[200px]">
                              {resumeFile ? resumeFile.name : 'Upload custom resume (Optional)'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">PDF / DOCX / TXT</span>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={applying}
                          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-755 text-white font-black rounded-2xl text-xs tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                        >
                          {applying ? <RefreshCw className="animate-spin" size={14} /> : 'Apply Now'}
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 text-center leading-normal">
                        *Applying will automatically attach your profile's AI resume evaluation scores ({user?.progress?.resume || 0}% ATS match) to the application dashboard.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;
