import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Missing API Key');
}

export const aiModelSyllabus = "perplexity/sonar-reasoning";
export const aiModelLesson = "anthropic/claude-3.5-sonnet";

export const openai = new OpenAI({
    // apiKey: process.env.OPENAI_API_KEY
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL:"https://openrouter.ai/api/v1",
    // baseURL: "https://api.x.ai/v1",
});
