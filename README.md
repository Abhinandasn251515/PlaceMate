# PlaceMate - AI-Powered Placement Preparation Portal

PlaceMate is a comprehensive, production-ready full-stack web application designed to help students master coding, aptitude, and interview preparation for top tech companies.

## Features Built
- **Authentication:** JWT based Register/Login with protected routes.
- **Dynamic Dashboard:** Aesthetic charts (Chart.js) and statistics to track progress.
- **Modern UI:** Built with Vite, React, Tailwind CSS v4, and Framer Motion.
- **Robust Backend:** Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running on default port 27017, or configure `.env` in `backend`)

### Installation
1. Clone the repository and run the root installation script:
```bash
npm run install:all
```

2. Seed the database (optional, populates test users):
```bash
cd backend
node seed.js
```

### Running the App
Run the following command from the root directory to concurrently start both the frontend and backend development servers:
```bash
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Test Accounts
You can log in with the following test credentials after seeding:
- Email: `admin@placemate.com` / Password: `password123`
- Email: `student@example.com` / Password: `password123`
