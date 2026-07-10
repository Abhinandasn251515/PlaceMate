import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Job from './models/Job.js';
import Message from './models/Message.js';
import Task from './models/Task.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB for seeding...');

    // Clear existing data (optional, but good for clean demo runs)
    await Job.deleteMany({});
    await Message.deleteMany({});
    console.log('🧹 Cleaned existing jobs and messages.');

    // 1. Create a dummy Recruiter user to associate the jobs with
    const recruiterEmail = 'recruiter@placemate.com';
    let recruiter = await User.findOne({ email: recruiterEmail });

    if (!recruiter) {
      recruiter = await User.create({
        name: 'Jane Doe (Google HR)',
        email: recruiterEmail,
        password: 'password123', // Will be hashed by userSchema pre-save hook
        role: 'recruiter'
      });
      console.log('👤 Created default recruiter account:', recruiterEmail);
    }

    // 2. Seed Mock Job Listings / Placement Drives
    const jobs = [
      {
        title: 'Software Development Engineer - I (SDE 1)',
        company: 'Google',
        description: 'Join the Google Cloud infrastructure team to build next-generation scalable services. You will design, build, and optimize core features of high-throughput distributed systems.',
        requirements: 'Proficiency in Java, C++, or Go. Strong foundations in Data Structures, Algorithms, and Object-Oriented Design. Experience with cloud services is a plus.',
        ctc: '35 LPA',
        location: 'Bangalore, Karnataka',
        postedBy: recruiter._id
      },
      {
        title: 'Full Stack Web Developer',
        company: 'Razorpay',
        description: 'Razorpay is hiring Web Engineers to join our merchant experience team. You will build user-friendly interfaces using React, state management libraries, and robust REST/GraphQL APIs on Node.js.',
        requirements: 'Experience with React, TailwindCSS, Node.js, Express, and SQL/NoSQL databases. Understanding of API security, JWT, and browser rendering optimization.',
        ctc: '18 LPA',
        location: 'Remote (India)',
        postedBy: recruiter._id
      },
      {
        title: 'Graduate Engineer Trainee (GET)',
        company: 'Tata Consultancy Services',
        description: 'Excellent entry-level opportunity for graduating engineers to jumpstart their career. You will undergo an intensive training program on Full-stack development, QA automation, or cloud computing before deployment to live client projects.',
        requirements: 'B.Tech/B.E./MCA degree. Good conceptual knowledge of programming logic, Databases (SQL), and Software Engineering methodologies.',
        ctc: '7 LPA',
        location: 'Pune, Maharashtra',
        postedBy: recruiter._id
      }
    ];

    await Job.insertMany(jobs);
    console.log('💼 Seeded 3 placement jobs successfully!');

    // 3. Seed welcome message in chat history
    const welcomeMessages = [
      {
        sender: 'PlaceMate Bot',
        text: 'Welcome to the PlaceMate AI General Chat! Feel free to ask questions and share resources.',
        channel: '#general'
      },
      {
        sender: 'Alumni Team',
        text: 'Google and Razorpay drives have been posted on the Job Board. Make sure to optimize your resumes and practice mock interviews before applying!',
        channel: '#general'
      },
      {
        sender: 'Coding Mentor',
        text: 'For coding tests, practice Graph traversals (DFS/BFS) and Dynamic Programming (Knapsack). Evaluators love optimal space complexities.',
        channel: '#coding-talk'
      }
    ];

    await Message.insertMany(welcomeMessages);
    console.log('💬 Seeded welcome chat history!');

    console.log('🎉 Seeding completed successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    mongoose.connection.close();
  }
};

seedData();
