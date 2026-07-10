import React, { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Download, Plus, Trash2, LayoutTemplate, Eye, FileText, Sparkles, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TEMPLATES = [
  { id: 'classic', name: 'Classic Minimalist', description: 'Clean, standard format preferred by traditional firms' },
  { id: 'modern', name: 'Modern Tech', description: 'Sleek sidebar layout perfect for software engineers' },
  { id: 'creative', name: 'Creative Tech', description: 'Vibrant, styled layout for web developers and designers' }
];

const ResumeBuilder = () => {
  const { user } = useContext(AuthContext);
  const previewRef = useRef(null);
  
  const [template, setTemplate] = useState('classic');
  const [resumeData, setResumeData] = useState({
    personal: {
      name: user?.name || 'Abhinandan Sharma',
      email: user?.email || 'abhinandan@gmail.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/abhinandan',
      github: 'github.com/abhinandan',
      role: 'Software Development Engineer'
    },
    education: [
      { id: 1, degree: 'B.Tech in Computer Science', institution: 'State Technical University', year: '2022 - 2026', cgpa: '9.2 CGPA' }
    ],
    experience: [
      { id: 1, role: 'Software Engineer Intern', company: 'TechSolutions Corp', duration: 'June 2025 - August 2025', description: 'Developed web applications using React and Firebase. Optimized database queries in Firestore reducing latency by 20%.' }
    ],
    projects: [
      { id: 1, title: 'PlaceMate Preparation Portal', techStack: 'React, TailwindCSS, Firebase, Monaco Editor', description: 'Built a real-time placement portal with live coding compilers, aptitude tests, and community discussion rooms.' }
    ],
    skills: 'React, JavaScript, Python, Node.js, Firebase, Firestore, TailwindCSS, Data Structures & Algorithms',
    achievements: 'Winner of National Level Hackathon 2025; Solved 400+ problems on LeetCode; Smart India Hackathon finalist.'
  });

  const handleChange = (section, field, value, id = null) => {
    if (id) {
      setResumeData({
        ...resumeData,
        [section]: resumeData[section].map(item => item.id === id ? { ...item, [field]: value } : item)
      });
    } else {
      setResumeData({
        ...resumeData,
        [section]: section === 'personal' 
          ? { ...resumeData.personal, [field]: value }
          : value
      });
    }
  };

  const addField = (section) => {
    const newId = Date.now();
    let newItem = {};
    if (section === 'education') newItem = { id: newId, degree: '', institution: '', year: '', cgpa: '' };
    if (section === 'experience') newItem = { id: newId, role: '', company: '', duration: '', description: '' };
    if (section === 'projects') newItem = { id: newId, title: '', techStack: '', description: '' };
    
    setResumeData({ ...resumeData, [section]: [...resumeData[section], newItem] });
  };

  const removeField = (section, id) => {
    setResumeData({ ...resumeData, [section]: resumeData[section].filter(item => item.id !== id) });
  };

  const handleExportPDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    toast.info("Generating high-quality PDF...");

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`);
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-6.5rem)]">
      {/* Editor Panel */}
      <div className="w-full xl:w-1/2 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap justify-between items-center gap-3">
          <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <LayoutTemplate size={20} className="text-indigo-500" /> Resume Builder
          </h2>
          
          <div className="flex items-center gap-3">
            <select 
              value={template} 
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Personal Info */}
          <section className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Full Name" value={resumeData.personal.name} onChange={(e) => handleChange('personal', 'name', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500" />
              <input placeholder="Target Role (e.g. SDE)" value={resumeData.personal.role} onChange={(e) => handleChange('personal', 'role', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500" />
              <input placeholder="Email" type="email" value={resumeData.personal.email} onChange={(e) => handleChange('personal', 'email', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500" />
              <input placeholder="Phone" value={resumeData.personal.phone} onChange={(e) => handleChange('personal', 'phone', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500" />
              <input placeholder="LinkedIn URL" value={resumeData.personal.linkedin} onChange={(e) => handleChange('personal', 'linkedin', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500" />
              <input placeholder="GitHub URL" value={resumeData.personal.github} onChange={(e) => handleChange('personal', 'github', e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm focus:border-indigo-500" />
            </div>
          </section>

          {/* Education */}
          <section className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Education</h3>
              <button onClick={() => addField('education')} className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-xs font-bold"><PlusCircle size={14}/> Add</button>
            </div>
            <div className="space-y-4">
              {resumeData.education.map(edu => (
                <div key={edu.id} className="relative p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => removeField('education', edu.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                    <input placeholder="Degree (e.g. B.Tech CS)" value={edu.degree} onChange={(e) => handleChange('education', 'degree', e.target.value, edu.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                    <input placeholder="Institution" value={edu.institution} onChange={(e) => handleChange('education', 'institution', e.target.value, edu.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                    <input placeholder="Year (e.g. 2022-2026)" value={edu.year} onChange={(e) => handleChange('education', 'year', e.target.value, edu.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                    <input placeholder="CGPA/Percentage" value={edu.cgpa} onChange={(e) => handleChange('education', 'cgpa', e.target.value, edu.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Work Experience */}
          <section className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Work Experience</h3>
              <button onClick={() => addField('experience')} className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-xs font-bold"><PlusCircle size={14}/> Add</button>
            </div>
            <div className="space-y-4">
              {resumeData.experience.map(exp => (
                <div key={exp.id} className="relative p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => removeField('experience', exp.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6 mb-3">
                    <input placeholder="Role (e.g. Software Intern)" value={exp.role} onChange={(e) => handleChange('experience', 'role', e.target.value, exp.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                    <input placeholder="Company" value={exp.company} onChange={(e) => handleChange('experience', 'company', e.target.value, exp.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                    <input placeholder="Duration (e.g. June 2025 - Present)" value={exp.duration} onChange={(e) => handleChange('experience', 'duration', e.target.value, exp.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                  </div>
                  <textarea placeholder="Job Description (Accomplishments and technologies used)" value={exp.description} onChange={(e) => handleChange('experience', 'description', e.target.value, exp.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white h-20 resize-none" />
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Projects</h3>
              <button onClick={() => addField('projects')} className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-xs font-bold"><PlusCircle size={14}/> Add</button>
            </div>
            <div className="space-y-4">
              {resumeData.projects.map(proj => (
                <div key={proj.id} className="relative p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button onClick={() => removeField('projects', proj.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6 mb-3">
                    <input placeholder="Project Title" value={proj.title} onChange={(e) => handleChange('projects', 'title', e.target.value, proj.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                    <input placeholder="Tech Stack (e.g. React, Node.js)" value={proj.techStack} onChange={(e) => handleChange('projects', 'techStack', e.target.value, proj.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white" />
                  </div>
                  <textarea placeholder="Description" value={proj.description} onChange={(e) => handleChange('projects', 'description', e.target.value, proj.id)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none dark:text-white h-20 resize-none" />
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Skills</h3>
            <textarea 
              placeholder="Comma separated skills (e.g. React, Node.js, Python, MongoDB)" 
              value={resumeData.skills} 
              onChange={(e) => handleChange('skills', 'skills', e.target.value)} 
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-300 resize-none h-20 text-sm focus:border-indigo-500" 
            />
          </section>

          {/* Achievements / Certifications */}
          <section className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Achievements & Certifications</h3>
            <textarea 
              placeholder="Semicolon separated achievements (e.g. Winner of Hackathon; Certified AWS Practitioner)" 
              value={resumeData.achievements} 
              onChange={(e) => handleChange('achievements', 'achievements', e.target.value)} 
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-700 dark:text-slate-300 resize-none h-20 text-sm focus:border-indigo-500" 
            />
          </section>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-full xl:w-1/2 bg-slate-200 dark:bg-slate-950 rounded-2xl overflow-y-auto flex flex-col p-6 items-center justify-start border border-slate-300 dark:border-slate-800 shadow-inner">
         <div 
           ref={previewRef}
           id="printable-resume-area"
           className="bg-white shadow-2xl p-10 text-slate-900 font-sans w-full max-w-[800px] min-h-[1130px] rounded-sm relative scale-90 sm:scale-100 origin-top transform-gpu"
           style={{ color: '#1e293b' }}
         >
            {/* CLASSIC MINIMALIST TEMPLATE */}
            {template === 'classic' && (
              <div className="space-y-6">
                <div className="text-center border-b border-slate-300 pb-4">
                  <h1 className="text-3xl font-extrabold tracking-wide uppercase text-slate-900">{resumeData.personal.name || 'Your Name'}</h1>
                  <p className="text-indigo-600 font-semibold tracking-wide text-sm mt-1">{resumeData.personal.role || 'SDE / Engineering Student'}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                    {resumeData.personal.phone && <span>• {resumeData.personal.phone}</span>}
                    {resumeData.personal.linkedin && <span>• {resumeData.personal.linkedin}</span>}
                    {resumeData.personal.github && <span>• {resumeData.personal.github}</span>}
                  </div>
                </div>

                {/* Education */}
                {resumeData.education.some(e => e.degree) && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-1 mb-3">Education</h2>
                    <div className="space-y-3">
                      {resumeData.education.map(edu => (
                        <div key={edu.id}>
                          <div className="flex justify-between font-bold text-slate-800 text-sm">
                            <span>{edu.degree}</span>
                            <span className="text-slate-500 font-normal text-xs">{edu.year}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                            <span>{edu.institution}</span>
                            <span className="font-semibold text-slate-700">{edu.cgpa}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {resumeData.experience.some(e => e.role) && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-1 mb-3">Work Experience</h2>
                    <div className="space-y-4">
                      {resumeData.experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between font-bold text-slate-800 text-sm">
                            <span>{exp.role} @ {exp.company}</span>
                            <span className="text-slate-500 font-normal text-xs">{exp.duration}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects.some(p => p.title) && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-1 mb-3">Academic & Personal Projects</h2>
                    <div className="space-y-4">
                      {resumeData.projects.map(proj => (
                        <div key={proj.id}>
                          <div className="flex justify-between font-bold text-slate-800 text-sm">
                            <span>{proj.title}</span>
                            <span className="text-indigo-600 text-xs font-semibold">{proj.techStack}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-1 mb-2">Technical Skills</h2>
                    <p className="text-xs text-slate-700 leading-relaxed">{resumeData.skills}</p>
                  </div>
                )}

                {/* Achievements */}
                {resumeData.achievements && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-1 mb-2">Achievements & Certifications</h2>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5 leading-relaxed">
                      {resumeData.achievements.split(';').map((ach, idx) => ach.trim() && (
                        <li key={idx}>{ach.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* MODERN TECH TEMPLATE */}
            {template === 'modern' && (
              <div className="grid grid-cols-3 gap-8 min-h-[1050px]">
                {/* Left Sidebar */}
                <div className="col-span-1 bg-slate-900 text-slate-100 -m-10 p-8 flex flex-col space-y-6">
                  <div className="mt-4">
                    <h1 className="text-xl font-black uppercase tracking-wider text-white leading-tight">{resumeData.personal.name || 'Your Name'}</h1>
                    <p className="text-xs text-indigo-400 font-semibold mt-1.5">{resumeData.personal.role || 'SDE / Engineering Student'}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800 text-[11px]">
                    <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Contact</h3>
                    {resumeData.personal.email && <div className="break-all"><strong className="text-white">Email:</strong> {resumeData.personal.email}</div>}
                    {resumeData.personal.phone && <div><strong className="text-white">Phone:</strong> {resumeData.personal.phone}</div>}
                    {resumeData.personal.linkedin && <div className="break-all"><strong className="text-white">LinkedIn:</strong> {resumeData.personal.linkedin}</div>}
                    {resumeData.personal.github && <div className="break-all"><strong className="text-white">GitHub:</strong> {resumeData.personal.github}</div>}
                  </div>

                  {resumeData.skills && (
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.split(',').map((s, idx) => (
                          <span key={idx} className="bg-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded font-medium">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Area */}
                <div className="col-span-2 space-y-6 pt-4">
                  {/* Education */}
                  {resumeData.education.some(e => e.degree) && (
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Education</h2>
                      <div className="space-y-3">
                        {resumeData.education.map(edu => (
                          <div key={edu.id}>
                            <div className="flex justify-between font-bold text-slate-800 text-sm">
                              <span>{edu.degree}</span>
                              <span className="text-slate-500 font-normal text-xs">{edu.year}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                              <span>{edu.institution}</span>
                              <span className="font-semibold text-slate-700">{edu.cgpa}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.some(e => e.role) && (
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Work Experience</h2>
                      <div className="space-y-4">
                        {resumeData.experience.map(exp => (
                          <div key={exp.id}>
                            <div className="flex justify-between font-bold text-slate-800 text-sm">
                              <span>{exp.role}</span>
                              <span className="text-slate-500 font-normal text-xs">{exp.duration}</span>
                            </div>
                            <p className="text-xs text-indigo-600 font-bold mt-0.5">{exp.company}</p>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.some(p => p.title) && (
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Projects</h2>
                      <div className="space-y-4">
                        {resumeData.projects.map(proj => (
                          <div key={proj.id}>
                            <div className="flex justify-between font-bold text-slate-800 text-sm">
                              <span>{proj.title}</span>
                              <span className="text-slate-500 font-normal text-xs">{proj.techStack}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {resumeData.achievements && (
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">Achievements</h2>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {resumeData.achievements.split(';').map((ach, idx) => ach.trim() && (
                          <li key={idx} className="leading-relaxed">{ach.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CREATIVE TECH TEMPLATE */}
            {template === 'creative' && (
              <div className="space-y-6">
                {/* Header banner */}
                <div className="bg-indigo-600 text-white -m-10 p-8 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-black tracking-wide uppercase">{resumeData.personal.name || 'Your Name'}</h1>
                      <p className="text-indigo-200 font-bold text-sm tracking-wide mt-1.5">{resumeData.personal.role || 'SDE / Engineering Student'}</p>
                    </div>
                    <div className="text-[10px] text-right text-indigo-100 font-semibold space-y-0.5">
                      {resumeData.personal.email && <div>{resumeData.personal.email}</div>}
                      {resumeData.personal.phone && <div>{resumeData.personal.phone}</div>}
                      {resumeData.personal.linkedin && <div>{resumeData.personal.linkedin}</div>}
                      {resumeData.personal.github && <div>{resumeData.personal.github}</div>}
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    {/* Experience */}
                    {resumeData.experience.some(e => e.role) && (
                      <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded mb-3">Experience</h2>
                        <div className="space-y-4">
                          {resumeData.experience.map(exp => (
                            <div key={exp.id} className="border-l-2 border-indigo-200 pl-4">
                              <div className="flex justify-between font-bold text-slate-800 text-sm">
                                <span>{exp.role}</span>
                                <span className="text-slate-500 font-normal text-xs">{exp.duration}</span>
                              </div>
                              <p className="text-xs text-indigo-500 font-semibold mt-0.5">{exp.company}</p>
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.some(p => p.title) && (
                      <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded mb-3">Projects</h2>
                        <div className="space-y-4">
                          {resumeData.projects.map(proj => (
                            <div key={proj.id} className="border-l-2 border-indigo-200 pl-4">
                              <div className="flex justify-between font-bold text-slate-800 text-sm">
                                <span>{proj.title}</span>
                                <span className="text-slate-500 font-normal text-xs">{proj.techStack}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 space-y-6">
                    {/* Education */}
                    {resumeData.education.some(e => e.degree) && (
                      <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded mb-3">Education</h2>
                        <div className="space-y-3">
                          {resumeData.education.map(edu => (
                            <div key={edu.id} className="text-xs">
                              <p className="font-bold text-slate-800">{edu.degree}</p>
                              <p className="text-slate-500 mt-0.5">{edu.year}</p>
                              <p className="text-slate-600 mt-0.5">{edu.institution}</p>
                              <p className="font-bold text-indigo-600 mt-1">{edu.cgpa}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills && (
                      <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills.split(',').map((s, idx) => (
                            <span key={idx} className="bg-indigo-50 text-[10px] text-indigo-600 px-2 py-0.5 rounded font-bold">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {resumeData.achievements && (
                      <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded mb-3">Achievements</h2>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5">
                          {resumeData.achievements.split(';').map((ach, idx) => ach.trim() && (
                            <li key={idx} className="leading-relaxed">{ach.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
