import OpenAI from 'openai';

if (!process.env.XAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

export const aiModel = "gpt-4o-mini";
// export const aiModel = "grok-2-latest";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
    // baseURL: "https://api.x.ai/v1",
});