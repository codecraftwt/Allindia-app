import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyAAeEVnh_bXohVJjNEHLxYVhWAIC0YDVxg';

const MODELS_TO_TRY = [
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-1.5-pro'
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
  const prompt = `
    You are an expert ATS recruitment AI.
    Generate 3 highly tailored, specific, professional suggestions/options for the "${nextKey}" section of a candidate's resume who is targeting the job of "${job}".
    Make the suggestions highly relevant to "${job}". For projects, achievements, and certifications, provide realistic, high-value technical/professional examples.
    For hobbies and languages, provide realistic examples that fit a modern candidate.
    Respond with a single raw JSON string array of exactly 3 elements. Do not include markdown code block wrappers or extra text.
    Example output format:
    ["Option 1", "Option 2", "Option 3"]
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
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData.map(item => String(item));
      }
    } catch (e) {
      console.warn(`[GeminiService] Suggestion generation failed for model ${model}. Trying next...`);
    }
  }

  // Graceful offline mock fallback matching the nextKey
  if (nextKey === 'objective') {
    return [
      `To secure a challenging role as a ${job} and deliver high-performance applications.`,
      `Motivated professional seeking to leverage my technical expertise in a ${job} position.`,
      `Goal-oriented specialist looking to scale business operations and lead technical teams as a ${job}.`
    ];
  }
  if (nextKey === 'certifications') {
    return [
      `Google Professional Certificate in ${job}`,
      `Advanced Certificate in ${job} Methodologies`,
      `Certified Professional ${job} Practitioner`
    ];
  }
  if (nextKey === 'projects') {
    return [
      `High-Scale Enterprise E-Commerce platform optimized for mobile and desktop`,
      `Interactive Portfolio Showcase and custom service automation platform`,
      `AI-powered Chat and workflow optimization assistant tool`
    ];
  }
  if (nextKey === 'languages') {
    return [
      'English, Hindi',
      'English, Hindi, regional language',
      'English, professional communication'
    ];
  }
  if (nextKey === 'achievements') {
    return [
      `Won 1st Place in Inter-College Hackathon representing ${job} domain`,
      `Successfully built and deployed custom solution used by 100+ active users`,
      `Delivered complex product features within deadline with zero critical bugs`
    ];
  }
  return [
    'Coding, Tech Blogging, Reading',
    'Cricket, Traveling, Fitness',
    'Gaming, Music, Photography'
  ];
}
