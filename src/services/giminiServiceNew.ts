import axios from 'axios';

// Please set your Gemini API keys securely
export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

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

export interface AIResumeResponse {
  summary: string;
  experiences: {
    company: string;
    designation: string;
    bullets: string[];
  }[];
  skills: string[];
  projects?: string;
  certifications?: string;
  languages?: string;
  achievements?: string;
  hobbies?: string;
  score: number;
}

export async function generateAIResume(
  profileData: any,
  targetJob: string,
  tone: string,
  jobDescription?: string
): Promise<AIResumeResponse> {
  const experiences = profileData?.experience || [];
  const educations = profileData?.education || [];
  const personal = profileData?.personal || {};

  const prompt = `
    You are an expert ATS (Applicant Tracking System) recruiter and career coach.
    Your task is to analyze the candidate's profile and target job to generate a highly professional, ATS-optimized resume.

    Candidate Profile Details:
    - Name: ${personal?.name || 'Candidate'}
    - Bio: ${personal?.bio || 'Not provided'}
    - Target Job Role: ${targetJob}
    - Tone/Style Selected: ${tone}
    - Target Job Description (JD) to match: ${jobDescription || 'Not provided'}
    
    Work Experience List:
    ${JSON.stringify(experiences)}

    Education List:
    ${JSON.stringify(educations)}

    Instructions:
    1. Rewrite the Candidate Summary into a highly compelling, professional 3-4 sentence paragraph tailored to the target job and selected tone. Use ONLY the provided Candidate Bio and experience.
    2. Analyze ALL entries in the Work Experience List. For EACH experience, output the company name, designation, and enhance their duties into 2-4 action-oriented achievement bullet points. Do NOT invent new companies or roles.
    3. Extract a list of 8-12 high-impact skills (both hard tech skills and soft skills) most relevant for the target job and candidate experience. Only extract skills supported by their profile.
    4. If the profile contains projects, achievements, certifications, languages, or hobbies, format them beautifully as strings. If missing, leave them as empty strings.
    5. Calculate a realistic ATS profile strength score (between 70 and 98) based on completeness and match quality.
    6. CRITICAL RULE: DO NOT hallucinate, fabricate, or invent any data, certifications, projects, or experiences. Strictly use the provided candidate data. If data is sparse, enhance what exists but do not invent new facts.

    You MUST respond with a single, raw JSON object. Do not include any conversational text or markdown code block markers. Follow this exact JSON structure:
    {
      "summary": "The rewritten professional summary paragraph.",
      "experiences": [
        {
          "company": "Company Name from profile",
          "designation": "Role from profile",
          "bullets": [
            "Action-oriented achievement bullet point 1",
            "Action-oriented achievement bullet point 2"
          ]
        }
      ],
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "projects": "Formatted string of projects, or empty if none",
      "certifications": "Formatted string of certifications, or empty if none",
      "languages": "Formatted string of languages, or empty if none",
      "achievements": "Formatted string of achievements, or empty if none",
      "hobbies": "Formatted string of hobbies, or empty if none",
      "score": 85
    }
  `;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`[GeminiService] Attempting resume generation with model: ${model}`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await axios.post(
        endpoint,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const candidates = response?.data?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error(`Model ${model} returned empty suggestions`);
      }

      const responseText = candidates[0]?.content?.parts[0]?.text;
      const parsedData = cleanAndParseJSON(responseText);

      if (parsedData) {
        console.log(`[GeminiService] Success! Successfully generated resume using model: ${model}`);
        return {
          summary: parsedData.summary || 'Expert professional dedicated to target job roles.',
          experiences: parsedData.experiences || [],
          skills: parsedData.skills || ['React Native', 'TypeScript', 'JavaScript'],
          projects: parsedData.projects || '',
          certifications: parsedData.certifications || '',
          languages: parsedData.languages || '',
          achievements: parsedData.achievements || '',
          hobbies: parsedData.hobbies || '',
          score: parsedData.score || 85,
        };
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error.message;
      const statusCode = error?.response?.status;
      console.warn(
        `[GeminiService] Model ${model} failed (Status: ${statusCode}, Error: ${errorMsg}). Trying next fallback model...`
      );
    }
  }

  console.error('[GeminiService] All models in the fallback chain failed. Invoking graceful local mock generator.');
  return {
    summary: `Motivated and accomplished professional targeting a career as a ${targetJob}, using excellent skills to bring high value.`,
    experienceBullets: experiences.length > 0
      ? experiences.map((exp: any) => `Worked as ${exp.designation || 'Specialist'} at ${exp.company || 'Organization'}`)
      : [`Enhanced career milestones for ${targetJob}`],
    skills: ['Leadership', 'Problem Solving', targetJob],
    score: 80,
  };
}

export async function extractResumeFromPDF(fileBase64: string, mimeType: string): Promise<any> {
  const prompt = `
    You are an expert ATS recruitment AI. 
    I have attached a candidate's resume document.
    Extract the candidate's complete profile and format it exactly as a JSON object that matches this structure:
    {
      "personal": {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "city": "City or Location",
        "linkedin": "LinkedIn URL",
        "github": "Github URL"
      },
      "summary": "Professional summary or bio. If none exists, write one based on their experience.",
      "experiences": [
        {
          "company": "Company Name",
          "designation": "Job Title",
          "location": "Location",
          "startDate": "Start Date (e.g. Jan 2020)",
          "endDate": "End Date or Present",
          "isCurrent": boolean,
          "bullets": [
            "Achievement bullet point 1",
            "Achievement bullet point 2"
          ]
        }
      ],
      "education": [
        {
          "degree": "Degree Name",
          "school": "School/University Name",
          "year": "Graduation Year",
          "gpa": "GPA or Percentage"
        }
      ],
      "skills": ["Skill 1", "Skill 2"],
      "projects": "Formatted text of projects",
      "certifications": "Formatted text of certifications",
      "languages": "Formatted text of languages",
      "achievements": "Formatted text of achievements",
      "hobbies": "Formatted text of hobbies",
      "targetJob": "Detected primary job role/title (e.g., Software Engineer)"
    }
    You MUST respond with ONLY the raw JSON object. Do not include any conversational text or markdown code blocks.
  `;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`[GeminiService] Attempting PDF extraction with model: ${model}`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await axios.post(
        endpoint,
        {
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: fileBase64
                  }
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // PDF extraction might take longer
        }
      );

      const candidates = response?.data?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error(`Model ${model} returned empty response`);
      }

      const responseText = candidates[0]?.content?.parts[0]?.text;
      const parsedData = cleanAndParseJSON(responseText);

      if (parsedData) {
        console.log(`[GeminiService] Success! Extracted PDF using model: ${model}`);
        return parsedData;
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error?.message || error.message;
      const statusCode = error?.response?.status;
      console.warn(
        `[GeminiService] Model ${model} failed PDF extraction (Status: ${statusCode}, Error: ${errorMsg}).`
      );
    }
  }

  throw new Error('Failed to extract data from PDF. All models failed.');
}

export async function generateAISuggestions(
  nextKey: string,
  targetJob: string,
  profileData?: any
): Promise<string[]> {
  const job = targetJob;
  const count = nextKey === 'languages' ? 8 : 3;
  const prompt = `
    You are an expert ATS recruitment AI.
    Your task is to generate exactly ${count} short, highly tailored, specific suggestion options strictly for the "${nextKey}" section of a candidate's resume who is targeting the job of "${job}".

    CRITICAL RULES:
    1. ONLY generate suggestions for the "${nextKey}" section. Do NOT include, mention, or generate details for other sections (like projects, achievements, certificates, hobbies, languages) if "${nextKey}" is different.
    2. Keep each option extremely concise (maximum 10-15 words) so it fits inside a tiny button/chip on the mobile screen.
    3. Do NOT use markdown headers (e.g., #, ##), bold text (e.g., **), bullet points (*), or newlines (\\n). Return plain text strings only.
    4. For "${nextKey}" = "experience", suggest short descriptions like: "2 years of plumbing repairs and pipe installations" or "1 year of residential and commercial plumbing".
    5. For "${nextKey}" = "objective", suggest 1-sentence career objectives.
    6. For "${nextKey}" = "projects", suggest 1-sentence project titles with tech focus.
    7. For "${nextKey}" = "certifications", suggest only the names of professional certificates (e.g., "OSHA 10-Hour Certification").
    8. For "${nextKey}" = "languages", suggest only individual language names (e.g., "English", "Hindi", "Marathi", "Gujarati", "Bengali", "Spanish").

    Respond with a single raw JSON string array of exactly ${count} elements. Do not include markdown code block wrappers or any extra text.
    Example output format:
    ${count === 3 ? '["Option 1", "Option 2", "Option 3"]' : '["Language 1", "Language 2", "Language 3", "Language 4", "Language 5", "Language 6", "Language 7", "Language 8"]'}
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
          timeout: 4000,
        }
      );

      const responseText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedData = cleanAndParseJSON(responseText);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData.map(item => String(item));
      }
    } catch (e) {
      console.warn(`[GeminiService] Suggestion generation failed for model ${model}. Trying next...`);
    }
  }

  return [];
}

export async function searchAICertifications(
  query: string,
  targetJob: string
): Promise<string[]> {
  const prompt = `
    You are an expert resume builder AI.
    The candidate is searching for a certification using the query: "${query}".
    Their target job role is: "${targetJob}".
    
    Based on their search query and target job, generate exactly 3 professional, real, and recognizable certification titles (e.g., if query is "aws", suggest "AWS Certified Cloud Practitioner", "AWS Certified Solutions Architect - Associate", "AWS Certified Developer - Associate").
    Keep each suggestion concise, professional, and clear.
    Return ONLY a raw JSON string array of exactly 3 elements. Do NOT include markdown code block wrappers or any extra text.
    Example:
    ["AWS Certified Cloud Practitioner", "AWS Certified Developer - Associate", "AWS Certified Solutions Architect"]
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
          timeout: 4000,
        }
      );

      const responseText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedData = cleanAndParseJSON(responseText);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData.map(item => String(item));
      }
    } catch (e) {
      console.warn(`[GeminiService] Certification search failed for model ${model}. Trying next...`);
    }
  }

  const lowercaseQuery = query.toLowerCase();
  if (lowercaseQuery.includes('aws')) {
    return [
      'AWS Certified Cloud Practitioner',
      'AWS Certified Developer - Associate',
      'AWS Certified Solutions Architect - Associate'
    ];
  }
  if (lowercaseQuery.includes('azure')) {
    return [
      'Microsoft Certified: Azure Fundamentals (AZ-900)',
      'Microsoft Certified: Azure Developer Associate (AZ-204)',
      'Microsoft Certified: Azure Solutions Architect Expert'
    ];
  }
  if (lowercaseQuery.includes('google') || lowercaseQuery.includes('gcp')) {
    return [
      'Google Cloud Digital Leader',
      'Google Associate Cloud Engineer',
      'Google Professional Cloud Architect'
    ];
  }
  if (lowercaseQuery.includes('scrum') || lowercaseQuery.includes('agile')) {
    return [
      'Certified ScrumMaster (CSM)',
      'Professional Scrum Master I (PSM I)',
      'PMI Agile Certified Practitioner (PMI-ACP)'
    ];
  }
  const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1);
  return [
    `${formattedQuery} Professional Certificate`,
    `Advanced Certificate in ${formattedQuery}`,
    `Certified ${formattedQuery} Specialist`
  ];
}
