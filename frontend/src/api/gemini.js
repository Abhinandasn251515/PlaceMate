// Direct client-side integration with Google Gemini API

// Helper to retrieve the API key from LocalStorage, environment variables, or default fallback
export const getGeminiApiKey = () => {
  const localKey = localStorage.getItem('placemate_gemini_api_key');
  if (localKey && localKey.trim() !== '') {
    return localKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  // Default fallback key for out-of-the-box evaluator access
  return 'AQ.Ab8RN6JnJHYSvuaYzslpZLLTn-tYCngewgfeNTh90KN_mf13Q';
};

let cachedModel = null;

// Dynamic model selector to prevent 404 errors when specific models are deprecated or restricted
const getBestModel = async (apiKey) => {
  if (cachedModel) return cachedModel;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];

      // Filter models that support content generation and belong to the "flash" category, excluding non-public/restricted models
      const flashModels = models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent') && 
        m.name.toLowerCase().includes('flash') &&
        !m.name.toLowerCase().includes('omni')
      );

      if (flashModels.length > 0) {
        // Map to models with version info, stability flags, and capability size
        const mappedModels = flashModels.map(m => {
          const name = m.name.replace('models/', '');
          const nameLower = name.toLowerCase();
          const versionMatch = name.match(/gemini-(\d+(?:\.\d+)?)/i);
          const version = versionMatch ? parseFloat(versionMatch[1]) : 0;
          const isExperimental = nameLower.includes('-exp') || nameLower.includes('experimental') || nameLower.includes('preview');
          const is8B = nameLower.includes('8b');
          
          return { name, version, isExperimental, is8B };
        });

        // Sort descending: versioned models first, highest version first, stable first, non-8B first
        mappedModels.sort((a, b) => {
          const aHasVersion = a.version > 0;
          const bHasVersion = b.version > 0;
          if (aHasVersion !== bHasVersion) {
            return bHasVersion ? 1 : -1;
          }
          if (b.version !== a.version) {
            return b.version - a.version;
          }
          if (a.isExperimental !== b.isExperimental) {
            return a.isExperimental ? 1 : -1;
          }
          if (a.is8B !== b.is8B) {
            return a.is8B ? 1 : -1;
          }
          return b.name.localeCompare(a.name);
        });

        const modelName = mappedModels[0].name;
        cachedModel = modelName;
        console.log("Dynamically selected Gemini model:", modelName);
        return modelName;
      }

      // If no flash models are found, find any model that supports content generation, excluding omni
      const anyModel = models.find(m => 
        m.supportedGenerationMethods?.includes('generateContent') &&
        !m.name.toLowerCase().includes('omni')
      );
      if (anyModel) {
        const modelName = anyModel.name.replace('models/', '');
        cachedModel = modelName;
        console.log("Dynamically selected fallback Gemini model:", modelName);
        return modelName;
      }
    }
  } catch (err) {
    console.error("Failed to auto-detect models. Using fallback list:", err);
  }

  // Final fallback to standard latest Flash model
  cachedModel = 'gemini-1.5-flash-latest';
  return cachedModel;
};

// Generic fetch function for calling the Gemini API
const callGeminiAPI = async (prompt, systemInstruction = '', jsonMode = false) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it in the Settings panel.');
  }

  const modelName = await getBestModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (jsonMode) {
    requestBody.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });


  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP ${response.status} Error`;
    throw new Error(`Gemini API Call Failed: ${errMsg}`);
  }

  const data = await response.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error('Received an empty response from Gemini API.');
  }

  return textResponse;
};

/**
 * Renders an ATS analysis of a resume text.
 * @param {string} resumeText - The raw text content of the resume.
 * @param {string} targetRole - The target job description or role.
 * @returns {Promise<object>} Parsed JSON results containing scores, strengths, gaps, and recommendations.
 */
export const analyzeResume = async (resumeText, targetRole = 'Software Engineer') => {
  const systemInstruction = `You are an expert technical recruiter and ATS (Applicant Tracking System) optimization specialist.
Evaluate the user's resume against the target role: "${targetRole}".
You MUST return your output in JSON format matching the schema below.
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

  const prompt = `Analyze this candidate's resume for the role of "${targetRole}". Ranks skills match, format style, and action items.

Resume Text:
"""
${resumeText}
"""`;

  const jsonResult = await callGeminiAPI(prompt, systemInstruction, true);
  return JSON.parse(jsonResult);
};

/**
 * Generates interview questions based on the target role and question type.
 * @param {string} role - Target job role (e.g. Frontend Developer, Data Analyst).
 * @param {string} type - Question category (e.g. Technical, Behavioral, System Design).
 * @returns {Promise<string[]>} Array of 5 generated questions.
 */
export const generateInterviewQuestions = async (role = 'Software Developer', type = 'Technical') => {
  const systemInstruction = `You are a Senior Principal Engineer and an experienced interviewer.
Generate exactly 5 distinct, highly realistic interview questions for a candidate interviewing for the role of "${role}" with the focus area: "${type}".
Return the result strictly as a JSON array of strings containing only the questions.
Example output format: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

  const prompt = `Generate 5 challenging ${type} interview questions for a ${role} position.`;

  const jsonResult = await callGeminiAPI(prompt, systemInstruction, true);
  return JSON.parse(jsonResult);
};

/**
 * Evaluates the candidate's response to an interview question.
 * @param {string} question - The interview question.
 * @param {string} answer - The candidate's response.
 * @returns {Promise<object>} Evaluation results including score, strengths, critical missing items, and a model answer.
 */
export const evaluateInterviewAnswer = async (question, answer) => {
  const systemInstruction = `You are a technical interviewer evaluating a candidate's answer.
Analyze the candidate's response, provide constructive feedback, rate their answer, and provide a model answer.
Return the output strictly in JSON format matching the schema below.
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

  const jsonResult = await callGeminiAPI(prompt, systemInstruction, true);
  return JSON.parse(jsonResult);
};
