import { GoogleGenAI } from "@google/genai";
import { Quiz, QuizFormParams } from '../types';

const buildPrompt = (params: QuizFormParams): string => {
  const rules = `
You are an expert exam-question generator and content-creator. Generate high-quality exam questions in JSON format according to the request parameters. Follow these rules exactly:

1) INPUT PARAMETERS (will be provided): 
- subject (one of: Mathematics, Physics, Chemistry, Biology, English, Hindi, History, Geography, Computer Science, Economics, Business Studies, Accountancy, Political Science, Sociology, Psychology, Environmental Science, Fine Arts, Physical Education, Moral Science, General Knowledge)
- language ("en" or "hi") — "hi" must output Hindi text in Devanagari.
- quantity (integer, 1-200)
- question_type ("mcq", "true_false", "short_answer", "long_answer", "match", "fill_blank")
- difficulty ("easy", "medium", "hard")
- curriculum (optional string, e.g., "CBSE Class 10", "Undergraduate", "Competitive")
- include_explanations (true/false)

2) OUTPUT FORMAT: Return a JSON object with a top-level key "quiz" containing an array of questions. Each question object must include these exact fields:
- id: unique string id
- subject: same as input
- language: "en" or "hi"
- type: question_type
- difficulty: difficulty
- question_text: string (in requested language)
- options: array of strings (for mcq; for non-mcq return empty array [])
- correct_answer: string (exact option text for mcq or "True"/"False" for true_false or answer text for short/long)
- explanation: short explanation string (only if include_explanations is true; otherwise empty "")
- tags: array of relevant tags (max 5)
- estimated_time_seconds: integer (recommended seconds to solve)
- metadata: object { curriculum: string or null, created_by: "AI-Question-Generator", version: "1.0" }

3) CONTENT RULES:
- For language "hi" use natural Hindi (Devanagari). For "en" use clear English.
- MCQs must have 4 options, exactly one correct.
- Do not include any HTML or markdown in the strings — plain text only.
- Ensure accuracy for factual subjects; for numeric/math include values and units.
- Avoid culturally sensitive or biased content.
- For match type, format options as pairs in question_text and options remain []. For fill_blank include a placeholder like "_____".
- Keep explanation short (1-2 sentences) when requested.

4) EXAMPLES:
- If input asks quantity=5 and question_type="mcq", return 5 mcq question objects.
- If question_type="true_false", set options=[] and correct_answer either "True" or "False".

5) FINAL: Output only valid JSON (no surrounding commentary or extraneous text like \`\`\`json).

Now generate questions based on the following parameters:
`;
  return `${rules}${JSON.stringify(params, null, 2)}`;
};

export const generateQuestions = async (params: QuizFormParams): Promise<Quiz> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = buildPrompt(params);

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    const text = response.text;
    
    if (!text) {
        throw new Error("No text returned from Gemini API");
    }

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');

    const parsedData = JSON.parse(cleanedText);

    if (typeof parsedData === 'object' && parsedData !== null && 'quiz' in parsedData && Array.isArray(parsedData.quiz)) {
        return parsedData as Quiz;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the response from the AI. It did not return valid JSON.");
    }
    throw error;
  }
};

export const generateTopics = async (subject: string, language: string): Promise<string[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const langInstruction = language === 'hi' ? 'Hindi (in Devanagari script)' : 'English';
  const prompt = `Generate a list of 15 key topics or lessons for the subject '${subject}' in ${langInstruction}. Return the list as a JSON array of strings. For example: ["Topic 1", "Topic 2"]. Only output the JSON array, with no other text or markdown.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const text = response.text;

    if (!text) {
        throw new Error("No text returned from Gemini API");
    }

    const cleanedText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsedData = JSON.parse(cleanedText);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
      return parsedData;
    } else {
      throw new Error("AI did not return a valid array of strings for topics.");
    }
  } catch (error) {
    console.error("Error generating topics with Gemini API:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse topics from the AI. It did not return valid JSON.");
    }
    throw error;
  }
};