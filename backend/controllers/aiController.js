import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';

// Helper to get Google Gemini API client
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing on the server environment.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// @desc    Securely analyze resume via Gemini
// @route   POST /api/ai/analyze-resume
// @access  Private
export const analyzeResume = async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText) {
    return res.status(400).json({ message: 'Resume text is required.' });
  }

  try {
    const genAI = getGenAI();
    // We use gemini-1.5-flash since we are using v1beta or stable equivalent
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemInstruction = `You are an expert technical recruiter and ATS (Applicant Tracking System) optimization specialist.
Evaluate the user's resume against the target role: "${targetRole || 'Software Engineer'}".
You MUST return your output strictly in JSON format matching the schema below. Do not add markdown backticks.
Schema:
{
  "atsScore": number (0 to 100),
  "formattingScore": number (0 to 100),
  "skillsScore": number (0 to 100),
  "strengths": string[],
  "gaps": string[],
  "recommendations": [
    {
      "section": string,
      "suggestion": string,
      "action": string
    }
  ],
  "keywords": {
    "matched": string[],
    "missing": string[]
  }
}`;

    const prompt = `Analyze this candidate's resume for the role of "${targetRole || 'Software Engineer'}". Ranks skills match, format style, and action items.

Resume Text:
"""
${resumeText}
"""`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    // Save ATS score to user's resume progress
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.progress.resume = parsedData.atsScore;
        // Add XP reward (+40 XP)
        user.xp = (user.xp || 0) + 40;
        user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
        user.progress.overall = Math.round(
          (user.progress.coding + user.progress.aptitude + user.progress.mockTest + user.progress.resume) / 4
        );
        await user.save();
      }
    }

    res.json(parsedData);
  } catch (err) {
    console.error('Gemini Resume Analysis Error:', err.message);
    res.status(500).json({ message: `AI evaluation failed: ${err.message}` });
  }
};

// @desc    Securely evaluate interview response via Gemini
// @route   POST /api/ai/interview-feedback
// @access  Private
export const evaluateInterview = async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ message: 'Question and answer are required.' });
  }

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemInstruction = `You are a technical interviewer evaluating a candidate's response.
Analyze the candidate's response, provide constructive feedback, rate their answer, and provide a model answer.
Return the output strictly in JSON format matching the schema below. Do not add markdown backticks.
Schema:
{
  "score": number (0 to 100),
  "strengths": string,
  "missing": string,
  "modelAnswer": string
}`;

    const prompt = `
Question: ${question}
Candidate's Answer: "${answer}"
Evaluate this response. If the answer is extremely brief or empty, score it very low and explain what should have been said.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    res.json(parsedData);
  } catch (err) {
    console.error('Gemini Interview Evaluation Error:', err.message);
    res.status(500).json({ message: `AI interview evaluation failed: ${err.message}` });
  }
};

// @desc    Securely generate interview questions via Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
export const generateQuestions = async (req, res) => {
  const { role, level, topic } = req.body;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const systemInstruction = `You are a technical interviewer preparing questions for a candidate.
Generate an array of 5 technical and behavioral interview questions for a candidate preparing for the role of "${role || 'Software Engineer'}" (Experience Level: ${level || 'Entry Level'}, Topic/Focus: ${topic || 'General'}).
You MUST return your output strictly in JSON format matching the schema below. Do not add markdown backticks.
Schema:
{
  "questions": string[]
}`;

    const prompt = `Generate 5 interview questions for the role: "${role || 'Software Engineer'}".`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    res.json(parsedData.questions);
  } catch (err) {
    console.error('Gemini Generate Questions Error:', err.message);
    res.status(500).json({ message: `Failed to generate questions: ${err.message}` });
  }
};
