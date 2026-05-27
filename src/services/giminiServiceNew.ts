import axios from 'axios';

export const GEMINI_API_KEY = 'AIzaSyAAeEVnh_bXohVJjNEHLxYVhWAIC0YDVxg';
// export const GEMINI_API_KEY = 'AIzaSyDRwp1_Op86_rVdrUtFe80U3WzV1gLIZB0';



const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.0-flash-lite'
];

function cleanAndParseJSON(text: string): any {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse Gemini JSON:', error);
    return null;
  }
}

/**
 * Call Gemini to analyze the candidate's profile data against their target job
 * and return a matching ATS score and exactly 3 improvement suggestions.
 */
export async function analyzeResumeATS(
  profileData: any
): Promise<{ score: number; suggestions: string[] }> {
  const experiences = profileData?.experience || [];
  const educations = profileData?.education || [];
  const personal = profileData?.personal || {};
  const skills = profileData?.skills || [];

  const prompt = `
    You are an expert ATS (Applicant Tracking System) optimizer.
    First, identify the candidate's primary job role, title, or industry automatically based on their work experience, education, and skills.
    
    Candidate Data:
    - Profile Bio: ${personal?.bio || 'Not provided'}
    - Experience: ${JSON.stringify(experiences)}
    - Education: ${JSON.stringify(educations)}
    - Skills: ${JSON.stringify(skills)}

    Based on the detected job role, analyze the completeness and quality of their resume details to generate:
    1. A realistic ATS Match Score (integer between 50 and 95) showing how strong their resume is for that detected role.
    2. Exactly 3 distinct, highly actionable, specific improvement suggestions for their resume to improve their score.

    Return ONLY a raw JSON object with the following structure:
    {
      "score": 75,
      "suggestions": [
        "Add key skills like Redux Toolkit and React Native Navigation to match typical requirements.",
        "Include metrics/numbers in your work experience bullet points to demonstrate impact.",
        "Optimize your career summary to emphasize your years of experience in mobile development."
      ]
    }
  `;

  for (const model of MODELS_TO_TRY) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await axios.post(
        endpoint,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000,
        }
      );

      const responseText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedData = cleanAndParseJSON(responseText);
      if (parsedData && typeof parsedData === 'object' && typeof parsedData.score === 'number' && Array.isArray(parsedData.suggestions)) {
        return {
          score: parsedData.score,
          suggestions: parsedData.suggestions.slice(0, 3),
        };
      }
    } catch (e: any) {
      const errorMsg = e.response?.data?.error?.message || e.message || '';
      console.warn(`[GeminiService] ATS analysis failed for model ${model}. Error: ${errorMsg}`);
      if (errorMsg.includes('leaked') || errorMsg.includes('API key') || errorMsg.includes('denied')) {
        throw new Error(errorMsg);
      }
    }
  }

  throw new Error('ATS analysis failed for all models');
}
