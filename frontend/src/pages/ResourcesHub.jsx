import React, { useState } from 'react';
import { ExternalLink, Search, Star, PlayCircle, Globe, Code2, BrainCircuit, Layers, BookOpen, Users, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const resources = [
  // ── DSA & Coding ──────────────────────────────────────────────────────────
  {
    category: 'DSA & Coding',
    icon: Code2,
    color: 'blue',
    items: [
      { name: 'LeetCode', desc: 'Industry-standard DSA problem platform used by Google, Amazon, Microsoft', url: 'https://leetcode.com', type: 'Platform', rating: 5, tag: 'Must Use' },
      { name: 'GeeksForGeeks', desc: 'Comprehensive articles, problems, and interview experiences for all topics', url: 'https://geeksforgeeks.org', type: 'Website', rating: 5, tag: 'Must Use' },
      { name: 'HackerRank', desc: 'Company-sponsored challenges and certification programs', url: 'https://hackerrank.com', type: 'Platform', rating: 4, tag: 'Popular' },
      { name: 'CodeChef', desc: 'Competitive programming contests and DSA practice', url: 'https://codechef.com', type: 'Platform', rating: 4, tag: 'Competitive' },
      { name: 'Codeforces', desc: 'Advanced competitive programming for cracking top product companies', url: 'https://codeforces.com', type: 'Platform', rating: 4, tag: 'Advanced' },
      { name: 'NeetCode.io', desc: 'Curated LeetCode roadmap with video solutions — highly recommended', url: 'https://neetcode.io', type: 'Website', rating: 5, tag: 'Top Pick' },
    ]
  },
  // ── YouTube Channels ───────────────────────────────────────────────────────
  {
    category: 'YouTube Channels',
    icon: PlayCircle,
    color: 'red',
    items: [
      { name: 'Striver (TakeUForward)', desc: 'Best DSA course on YouTube — A to Z DSA Sheet, System Design, interviews', url: 'https://youtube.com/@takeUforward', type: 'YouTube', rating: 5, tag: 'Best for DSA' },
      { name: 'CodeWithHarry', desc: 'Hindi tutorials for full-stack web dev, Python, DSA — perfect for beginners', url: 'https://youtube.com/@CodeWithHarry', type: 'YouTube', rating: 5, tag: 'Hindi' },
      { name: 'NeetCode', desc: 'Clear LeetCode video solutions with intuitive explanations', url: 'https://youtube.com/@NeetCode', type: 'YouTube', rating: 5, tag: 'LeetCode' },
      { name: 'Apna College', desc: 'Free DSA + placement preparation in Hindi — 2M+ subscribers', url: 'https://youtube.com/@ApnaCollegeOfficial', type: 'YouTube', rating: 4, tag: 'Hindi' },
      { name: 'Gaurav Sen', desc: 'System Design explained simply — essential for product-based companies', url: 'https://youtube.com/@gkcs', type: 'YouTube', rating: 5, tag: 'System Design' },
      { name: 'Love Babbar', desc: 'DSA Sheet + placement interviews — extremely popular for campus drives', url: 'https://youtube.com/@LoveBabbar', type: 'YouTube', rating: 4, tag: 'Placement' },
    ]
  },
  // ── Aptitude ───────────────────────────────────────────────────────────────
  {
    category: 'Aptitude Preparation',
    icon: BrainCircuit,
    color: 'purple',
    items: [
      { name: 'IndiaBix', desc: 'India\'s #1 aptitude preparation site with 10,000+ company questions', url: 'https://indiabix.com', type: 'Website', rating: 5, tag: 'Must Use' },
      { name: 'PrepInsta', desc: 'Company-specific aptitude questions for TCS, Infosys, Wipro, etc.', url: 'https://prepinsta.com', type: 'Website', rating: 4, tag: 'Company-wise' },
      { name: 'Freshersworld', desc: 'Placement papers, aptitude tests, mock tests for off-campus drives', url: 'https://freshersworld.com', type: 'Website', rating: 4, tag: 'Off-campus' },
      { name: 'Sanfoundry', desc: '10,000+ MCQ questions on C, Java, DBMS, Networks, OS for exams', url: 'https://sanfoundry.com', type: 'Website', rating: 4, tag: 'MCQs' },
    ]
  },
  // ── System Design ──────────────────────────────────────────────────────────
  {
    category: 'System Design',
    icon: Layers,
    color: 'indigo',
    items: [
      { name: 'System Design Primer', desc: 'The most starred GitHub repo for learning system design — FREE', url: 'https://github.com/donnemartin/system-design-primer', type: 'GitHub', rating: 5, tag: 'Free' },
      { name: 'High Scalability', desc: 'Real-world architecture breakdowns of Netflix, Uber, Twitter, etc.', url: 'http://highscalability.com', type: 'Website', rating: 4, tag: 'Real-world' },
      { name: 'ByteByteGo', desc: 'Alex Xu\'s system design visual explanations — newsletter + YouTube', url: 'https://bytebytego.com', type: 'Website', rating: 5, tag: 'Top Pick' },
    ]
  },
  // ── CS Core Subjects ──────────────────────────────────────────────────────
  {
    category: 'CS Core Subjects',
    icon: Cpu,
    color: 'teal',
    items: [
      { name: 'Gate Smashers (OS)', desc: 'Best operating systems lectures in Hindi — used by millions', url: 'https://youtube.com/@GateSmashers', type: 'YouTube', rating: 5, tag: 'OS/DBMS' },
      { name: 'W3Schools', desc: 'Quick reference for HTML, CSS, JS, SQL, Python — great for brushing up', url: 'https://w3schools.com', type: 'Website', rating: 4, tag: 'Reference' },
      { name: 'Tutorialspoint', desc: 'Free tutorials on OS, DBMS, CN, OOPs, data structures', url: 'https://tutorialspoint.com', type: 'Website', rating: 4, tag: 'Free' },
      { name: 'JavaTPoint', desc: 'Core Java, DBMS, OS, SQL interview questions and tutorials', url: 'https://javatpoint.com', type: 'Website', rating: 4, tag: 'Interview' },
    ]
  },
  // ── Interview Prep ────────────────────────────────────────────────────────
  {
    category: 'Interview Preparation',
    icon: Users,
    color: 'orange',
    items: [
      { name: 'Glassdoor', desc: 'Real interview experiences from employees at top companies', url: 'https://glassdoor.com', type: 'Website', rating: 5, tag: 'Experiences' },
      { name: 'Blind', desc: 'Anonymous tech community for salary, interview, and career advice', url: 'https://teamblind.com', type: 'Community', rating: 4, tag: 'Community' },
      { name: 'GFG Interview Experiences', desc: 'Hundreds of real interview experiences categorised by company & role', url: 'https://geeksforgeeks.org/company-interview-corner/', type: 'Website', rating: 5, tag: 'Must Read' },
      { name: 'Pramp', desc: 'Free peer-to-peer mock technical interviews — practice with others', url: 'https://pramp.com', type: 'Platform', rating: 4, tag: 'Mock Interview' },
      { name: 'interviewing.io', desc: 'Practice with ex-FAANG engineers — get recorded mock interviews', url: 'https://interviewing.io', type: 'Platform', rating: 5, tag: 'FAANG Prep' },
    ]
  },
  // ── Free Courses ───────────────────────────────────────────────────────────
  {
    category: 'Free Courses & Roadmaps',
    icon: BookOpen,
    color: 'emerald',
    items: [
      { name: 'CS50 by Harvard', desc: 'World\'s most popular CS course — completely free on edX', url: 'https://cs50.harvard.edu', type: 'Course', rating: 5, tag: 'Free' },
      { name: 'The Odin Project', desc: 'Free full-stack web development curriculum — project-based learning', url: 'https://theodinproject.com', type: 'Course', rating: 5, tag: 'Full Stack' },
      { name: 'roadmap.sh', desc: 'Visual developer roadmaps for Frontend, Backend, DevOps, and more', url: 'https://roadmap.sh', type: 'Website', rating: 5, tag: 'Roadmap' },
      { name: 'freeCodeCamp', desc: 'Free certifications in web dev, Python, machine learning, and more', url: 'https://freecodecamp.org', type: 'Course', rating: 5, tag: 'Free Cert' },
      { name: 'NPTEL', desc: 'Free IIT/IISc lecture videos for CS subjects — great for GATE & placements', url: 'https://nptel.ac.in', type: 'Course', rating: 4, tag: 'IIT Lectures' },
    ]
  },
];

const COLOR_MAP = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/50' },
  red:     { bg: 'bg-red-50 dark:bg-red-900/20',      icon: 'bg-red-100 dark:bg-red-900/30 text-red-500',        badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',     border: 'border-red-200 dark:border-red-800/50' },
  purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20',icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/50' },
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/20',icon: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500',badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/50' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-900/20',    icon: 'bg-teal-100 dark:bg-teal-900/30 text-teal-500',    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',  border: 'border-teal-200 dark:border-teal-800/50' },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-900/20',icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500',badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800/50' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20',icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/50' },
};

const ResourcesHub = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const allCategories = ['All', ...resources.map(r => r.category)];

  const filtered = resources
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase()) ||
        item.tag.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(section =>
      (activeCategory === 'All' || section.category === activeCategory) &&
      section.items.length > 0
    );

  const totalCount = resources.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
            <Globe className="text-indigo-500" size={32} />
            Online Resources Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {totalCount} curated free resources — handpicked for placement success 🎯
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, topic, or tag (e.g. 'LeetCode', 'Hindi', 'System Design')..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-slate-900 transition-all shadow-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            {cat === 'All' ? `All (${totalCount})` : cat}
          </button>
        ))}
      </div>

      {/* Resource Sections */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>No resources found for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-10">
          {filtered.map((section, si) => {
            const colors = COLOR_MAP[section.color];
            return (
              <div key={section.category}>
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.icon}`}>
                    <section.icon size={18} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">{section.category}</h2>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {section.items.length} resources
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {section.items.map((item, i) => (
                    <motion.a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (si * 0.05) + (i * 0.05) }}
                      className={`group block p-5 rounded-2xl border ${colors.bg} ${colors.border} hover:shadow-lg transition-all hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.name}
                            </h3>
                            <ExternalLink size={13} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                              {item.tag}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{item.type}</span>
                          </div>
                        </div>
                        {/* Stars */}
                        <div className="flex ml-2 shrink-0">
                          {[...Array(5)].map((_, si) => (
                            <Star
                              key={si}
                              size={12}
                              className={si < item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <Globe size={12} /> Visit {item.name} →
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourcesHub;
