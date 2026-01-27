
import { GoogleGenAI } from "@google/genai";
import { TargetLanguage } from "../types";

export const translateHtml = async (html: string, language: TargetLanguage): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Translate the following HTML content from English to ${language}.
  
  CRITICAL INSTRUCTIONS:
  1. Preserve ALL HTML tags, attributes, and classes EXACTLY as they are.
  2. DO NOT change the structure of the HTML.
  3. PRESERVE ALL original formatting, including indentation, newlines, and whitespace.
  4. Only translate the text content inside the tags.
  5. Return ONLY the translated HTML. Do not include any introductory text, markdown code blocks (like \`\`\`html), or explanations.

  HTML to translate:
  ${html}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    let result = response.text || '';
    
    // Clean up if the model accidentally includes markdown markers
    result = result.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();
    
    return result;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate. Please check your connection or input.');
  }
};
