
import { GoogleGenAI } from "@google/genai";
import { TargetLanguage } from "../types";

export const translateHtml = async (html: string, language: TargetLanguage): Promise<string> => {
  // Use named parameter and direct process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fixed syntax error by escaping backticks within the template literal. 
  // This prevents the first backtick from closing the string prematurely.
  const prompt = `Переведи html с английского на ${language}, сохранив теги, классы и форматирование (их оставить без изменения).
  Верни ТОЛЬКО переведенный HTML-код без каких-либо пояснений или markdown-оберток (\`\`\`html ... \`\`\`).
  
  HTML для перевода:
  ${html}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for higher consistency in preserving tags
      }
    });

    // Accessing .text as a property as per the @google/genai documentation
    let result = response.text || '';
    
    // Cleanup potential markdown artifacts if the model ignores the instruction
    result = result.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();
    
    return result;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate HTML. Please check your input or try again later.');
  }
};
