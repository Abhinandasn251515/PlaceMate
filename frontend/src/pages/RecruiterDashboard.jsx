import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  createJob, 
  getRecruiterJobs, 
  getJobApplicants, 
  updateApplicationStatus 
} from '../api/backend';
import { 
  Briefcase, 
  Plus, 
  Users, 
  Building, 
  MapPin, 
  DollarSign, 
  FileText, 
  ArrowRight, 
  Check, 
  X, 
  RefreshCw,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);
  
  // Data States
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form States
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [ctc, setCtc] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const list = await getRecruiterJobs();
      setJobs(list);
      if (list.length > 0 && !selectedJob) {
        handleSelectJob(list[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load posted jobs.');
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    try {
      const list = await getJobApplicants(job._id);
      setApplicants(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve applicants.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title || !company || !ctc || !location || !description || !requirements) {
      toast.warning('Please fill out all fields.');
      return;
    }

    setSubmittingJob(true);
    try {
      await createJob({
        title,
        company,
        location,
        ctc,
        description,
        requirements
      });

      toast.success('Placement drive posted successfully!');
      
      // Reset form
      setTitle('');
      setCompany('');
      setLocation('');
      setCtc('');
      setDescription('');
      setRequirements('');
      setIsPostingJob(false);

      // Refresh job listings
      await fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to post job listing.');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      toast.success(`Application status updated to ${newStatus}`);
      
      // Update local state
      setApplicants(prev => prev.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update application status.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2.5">
            <Building className="text-indigo-500" size={32} />
            Recruiter Admin Panel
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your corporate placement drives, track candidate ATS scores, and shortlist profiles.
          </p>
        </div>

        <button
          onClick={() => setIsPostingJob(prev => !prev)}
          className="flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-755 text-white rounded-2xl text-xs font-black transition-all border-none cursor-pointer shadow-md shadow-indigo-500/10 shrink-0"
        >
          {isPostingJob ? 'Back to Dashboard' : (
            <>
              <Plus size={14} /> Create SDE Placement Drive
            </>
          )}
        </button>
      </header>

      {isPostingJob ? (
        /* Create Job Form */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-750 pb-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Create SDE Placement Drive</h2>
            <p className="text-xs text-slate-400 mt-1">Provide CTC packages, locations, and profile specifications.</p>
          </div>

          <form onSubmit={handlePostJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-455">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SDE 1 / Frontend Dev"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-455">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Razorpay / Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-455">CTC Compensation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 18 LPA"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-455">Job Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-455">Job Description</label>
              <textarea
                required
                rows={4}
                placeholder="Detail SDE roles, responsibilities, team structures..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-455">Technical Requirements & Skills</label>
              <textarea
                required
                rows={4}
                placeholder="e.g. React, Node.js, Graph DSA logic, strong communication..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-202 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-850 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingJob}
                className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submittingJob ? <RefreshCw className="animate-spin" size={14} /> : 'Post Placement Drive'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Recruiter Main Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Posted Jobs List */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">My SDE Postings</h3>
            
            {loadingJobs ? (
              <div className="text-center text-xs text-slate-400 py-10 font-bold">
                <RefreshCw className="animate-spin mx-auto mb-2" size={16} /> LoadingSDE jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-10 font-semibold leading-relaxed">
                You haven't posted any SDE drives yet. Click the top button to create one!
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map(job => {
                  const selected = selectedJob && selectedJob._id === job._id;
                  return (
                    <div
                      key={job._id}
                      onClick={() => handleSelectJob(job)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        selected
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-650'
                      }`}
                    >
                      <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{job.title}</h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black mt-0.5">{job.company}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Applicants Table */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm min-h-[450px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
                    {selectedJob ? `Applicants for ${selectedJob.company}` : 'Applicants Review'}
                  </h3>
                  {selectedJob && (
                    <p className="text-xs text-slate-800 dark:text-white font-black mt-0.5">{selectedJob.title}</p>
                  )}
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 text-[10px] font-black rounded-lg">
                  {applicants.length} Total
                </span>
              </div>

              {loadingApplicants ? (
                <div className="text-center text-xs text-slate-400 py-20 font-bold">
                  <RefreshCw className="animate-spin mx-auto mb-2" size={16} /> Retrieving candidate lists...
                </div>
              ) : !selectedJob ? (
                <div className="text-center text-xs text-slate-400 py-20 font-semibold leading-relaxed">
                  Select a SDE posting on the left to review student applications.
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center text-xs text-slate-450 dark:text-slate-500 py-20 font-semibold leading-relaxed space-y-2">
                  <Users size={32} className="mx-auto text-slate-300 dark:text-slate-650" />
                  <p>No candidates have applied for this drive yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650 dark:text-slate-350">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-750 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="pb-3">Candidate</th>
                        <th className="pb-3 text-center">Level</th>
                        <th className="pb-3 text-center">ATS Score</th>
                        <th className="pb-3 text-center">AI Interview</th>
                        <th className="pb-3 text-center">Resume</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                      {applicants.map(app => {
                        const student = app.studentId || {};
                        return (
                          <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/5 transition-all">
                            <td className="py-4">
                              <div className="font-black text-slate-805 dark:text-white">{student.name || 'Student'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{student.email || 'N/A'}</div>
                            </td>
                            <td className="py-4 text-center font-black">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-md text-[10px] text-slate-500">
                                Lvl {student.level || 1}
                              </span>
                            </td>
                            <td className="py-4 text-center font-extrabold">
                              <span className={`px-2 py-0.5 rounded-md ${
                                app.atsScore >= 80 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                                  : app.atsScore >= 60 
                                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' 
                                  : 'bg-red-50 dark:bg-red-950/20 text-red-600'
                              }`}>
                                {app.atsScore}%
                              </span>
                            </td>
                            <td className="py-4 text-center font-extrabold">
                              <span className={`px-2 py-0.5 rounded-md ${
                                app.interviewScore >= 80 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                                  : app.interviewScore >= 60 
                                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' 
                                  : 'bg-red-50 dark:bg-red-950/20 text-red-600'
                              }`}>
                                {app.interviewScore}%
                              </span>
                            </td>
                            <td className="py-4 text-center">
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex p-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 rounded-xl transition-all"
                              >
                                <FileText size={15} />
                              </a>
                            </td>
                            <td className="py-4 text-right">
                              <div className="inline-flex items-center gap-1.5 relative">
                                <select
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                  className="appearance-none pr-7 pl-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Under Review">Under Review</option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                <ChevronDown className="absolute right-2 text-slate-450 pointer-events-none" size={11} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
