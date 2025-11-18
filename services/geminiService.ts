
import { GoogleGenAI, Type } from "@google/genai";
import { ColorPalette } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    colors: {
      type: Type.ARRAY,
      description: "An array of exactly 5 unique hex color codes, each starting with #.",
      items: {
        type: Type.STRING
      }
    },
    justification: {
      type: Type.STRING,
      description: "A single sentence aesthetic justification for the color palette choice, explaining how the colors relate to the provided mood or keyword."
    }
  },
  required: ["colors", "justification"]
};

export const generateColorPalette = async (mood: string): Promise<ColorPalette> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a color palette for the mood or keyword: "${mood}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const jsonText = response.text.trim();
    const paletteData = JSON.parse(jsonText);
    
    if (!paletteData.colors || paletteData.colors.length !== 5) {
        throw new Error("Invalid color data received from API.");
    }

    return paletteData as ColorPalette;
  } catch (error) {
    console.error("Error generating color palette:", error);
    throw new Error("Failed to generate color palette. Please check your input or try again later.");
  }
};
