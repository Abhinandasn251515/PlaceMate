import api from './axios';

// AUTH APIs
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateUserProgress = async (progressData) => {
  const response = await api.put('/auth/progress', progressData);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/auth/leaderboard');
  return response.data;
};

// AI APIs (Secure server-side Gemini calling)
export const analyzeResume = async (resumeText, targetRole) => {
  const response = await api.post('/ai/analyze-resume', { resumeText, targetRole });
  return response.data;
};

export const evaluateInterview = async (question, answer) => {
  const response = await api.post('/ai/interview-feedback', { question, answer });
  return response.data;
};

export const generateQuestions = async (role, level, topic) => {
  const response = await api.post('/ai/generate-questions', { role, level, topic });
  return response.data;
};

// JOB BOARD APIs
export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const applyToJob = async (jobId, fileObj) => {
  // If file is provided, use multipart/form-data
  if (fileObj) {
    const formData = new FormData();
    formData.append('resume', fileObj);
    const response = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } else {
    // Apply using existing resume
    const response = await api.post(`/jobs/${jobId}/apply`);
    return response.data;
  }
};

export const getJobApplicants = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/applicants`);
  return response.data;
};

export const updateApplicationStatus = async (appId, status) => {
  const response = await api.put(`/jobs/applications/${appId}`, { status });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await api.get('/jobs/my-applications');
  return response.data;
};

export const getRecruiterJobs = async () => {
  const response = await api.get('/jobs/recruiter/my');
  return response.data;
};

// CHAT HISTORY APIs
export const getMessagesByChannel = async (channel) => {
  const response = await api.get(`/messages/${encodeURIComponent(channel)}`);
  return response.data;
};

// PLANNER APIs
export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const toggleTask = async (taskId) => {
  const response = await api.put(`/tasks/${taskId}/toggle`);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// CALENDAR APIs
export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};
