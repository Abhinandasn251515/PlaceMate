# 🎓 PlaceMate - Real-Time Placement Preparation Portal

PlaceMate is a comprehensive, production-ready, **100% serverless placement preparation portal** designed to help students master coding, aptitude quizzes, resume construction, and interview prep. It features real-time synchronization, custom Monaco-based code compilation, interactive assessments, and live global progression tracking.

🚀 **Live Production Link:** [https://placemate-d4bd0.web.app](https://placemate-d4bd0.web.app)

---

## 💻 Tech Stack & Architecture

- **Frontend:** React 18, Vite, TailwindCSS v4, Framer Motion (for fluid micro-interactions and glassmorphism)
- **Database & Sync:** Google Firebase Firestore (NoSQL realtime database)
- **Authentication:** Firebase Auth (Email/Password & Google Sign-In)
- **Hosting:** Firebase Hosting (CDN optimized)
- **Compilers & Editors:** Monaco Editor integration (VS Code engine in-browser)
- **PDF Engines:** `html2canvas` + `jsPDF` for client-side document compilation

---

## ⚡ Core Features

### 1. 📊 Dynamic Real-Time Dashboard & Progression Board
- **Live progression board:** A global real-time rankings board displaying registered preparation partners sorted by their overall preparation index.
- **Dynamic Weekly Activity Trend:** Integrated ChartJS spline tracker measuring daily preparation intensity based on solved items.
- **Live Activity Feed:** Broadcasts events instantly to all users (e.g. *"Abhinandan Ghosh registered for Google drive! 🚀"*).
- **Recruitment drive scheduler:** Real-time registration portal for active drives (Google, Microsoft, Amazon) with persistent registry tracking.

### 2. 📅 Day-by-Day Dynamic Challenges
- **Problem of the Day:** Deterministically selects a coding challenge based on the current calendar date (`dayIndex = date % list.length`), rotating automatically at midnight.
- **Aptitude Booster of the Day:** Pulls a dynamic quantitative, logical, or verbal booster question for daily quick practice.

### 3. 💻 In-Browser Coding Practice
- Embedded VS-Code Monaco editor supporting Javascript, Python, and Java templates.
- Active compile testing against standard and hidden test cases.
- Solved problems instantly recalculate profile coding progress in real-time.

### 4. 🧠 Timed Aptitude & Reasoning Assessments
- Comprehensive library of 45+ questions spanning Quantitative, Logical, and Verbal topics.
- **Multi-Filter tags:** Toggle by topic and difficulty (Easy / Medium / Hard) before launching assessments.
- Integrated countdown timers, correct option validations, and detailed explanations.

### 5. 📄 Advanced ATS Resume Builder
- Includes **three modular style templates** (Classic Minimalist, Modern Tech, and Creative Tech).
- Client-side high-resolution PDF download utilizing `html2canvas` and `jsPDF`.
- Supports target role titles, LinkedIn/GitHub urls, projects, and achievements.

### 6. 💬 Live Community Chat
- Multi-channel selector supporting `#general`, `#coding-talk`, and `#interview-prep` rooms.
- **Flashing Typing Indicator:** Live indicator showing other users active typing status (*"Abhinandan Ghosh is typing..."*) using Firestore event hooks.

---

## ⚙️ Getting Started (Local Run)

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd place-mate/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Re-seed Firestore collections (Optional):**
   ```bash
   node seedFirebase.js
   ```

4. **Run the local Vite development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤝 Contributing & Support
Submit bug reports, ask for content updates, or propose new features through the **Build Together** collaboration center on the live site!

---

**Designed & Developed with ❤️ by [Abhinandan Ghosh](https://github.com).**
