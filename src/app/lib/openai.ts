import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Missing API Key');
}

export const aiModelSyllabus = "openai/gpt-4.1-mini";
export const aiModelLesson = "openai/gpt-4.1-mini";

export const openai = new OpenAI({
    // apiKey: process.env.OPENAI_API_KEY
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL:"https://openrouter.ai/api/v1",
    // baseURL: "https://api.x.ai/v1",
});
