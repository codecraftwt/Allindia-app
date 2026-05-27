import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyAAeEVnh_bXohVJjNEHLxYVhWAIC0YDVxg';
//AIzaSyDQ8-zUo8uz27kWC665WP1CoAnEQIfijdw- raj sir 
//client=AIzaSyAAeEVnh_bXohVJjNEHLxYVhWAIC0YDVxg

const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.0-flash-lite'
];

export interface AIResumeResponse {
  summary: string;
  experienceBullets: string[];
  skills: string[];
  score: number;
}


function cleanAndParseJSON(text: string): any {
  try {
    let cleanText = text.trim();

    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse Gemini JSON, falling back to raw extractor:', error);
    return null;
  }
}

/**
 * Call Google Gemini API using a self-healing fallback chain to analyze profile details and build an optimized resume
 */
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
    1. Rewrite the Candidate Summary into a highly compelling, professional 3-4 sentence paragraph tailored to the target job and selected tone.
    2. Enhance the Work Experience bullet points. Make them action-oriented, professional, and include metric-driven achievements if possible (e.g., "Optimized database queries, improving dashboard speed by 35%").
    3. Extract a list of 8-12 high-impact skills (both hard tech skills and soft skills) most relevant for the target job and candidate experience.
    4. Calculate a realistic ATS profile strength score (between 70 and 98) based on completeness and match quality.

    You MUST respond with a single, raw JSON object. Do not include any conversational text or markdown code block markers. Follow this exact JSON structure:
    {
      "summary": "The rewritten professional summary paragraph.",
      "experienceBullets": [
        "Action-oriented achievement bullet point 1",
        "Action-oriented achievement bullet point 2",
        "Action-oriented achievement bullet point 3"
      ],
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "score": 85
    }
  `;

  // Try each model in the fallback chain sequentially
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
          timeout: 10000, // 10 second timeout per attempt
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
          experienceBullets: parsedData.experienceBullets || ['Enhanced career description and experience.'],
          skills: parsedData.skills || ['React Native', 'TypeScript', 'JavaScript'],
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

  // Final graceful fallback in case the entire chain failed (network down / API keys blocked)
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

/**
 * Dynamically generate tailored quick-tap suggestion pills for the candidate using Gemini AI based on target job role.
 */
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

  // Enforce fully dynamic AI-only behavior: no mock fallbacks
  return [];
}

/**
 * Search and suggest professional certification titles based on user keywords using Gemini AI.
 */
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

  // Graceful fallback suggestions based on query
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
