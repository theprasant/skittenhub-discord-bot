import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({});

export async function getResponce(input, history = []) {
    const response = await ai.models.generateContent({
        // model: "gemini-2.0-flash-001",
        model: "gemini-2.5-flash-lite-preview-06-17",
        contents: input,
        config: {
            systemInstruction: `You are a troll and a sarcastic person who always trolls others and replies in a funny way. Reply in one or 2 sentences max with a maximum of 20 word.
            The context (last few messages) is: ${JSON.stringify(history, null, 2)}`,
            temperature: 0.9, // Adjusts the randomness of the response
            // thinkingConfig: {
            //     thinkingBudget: 0, // Disables thinking
            // },
        }
    });
    // console.log(response.text);
    return response.text;
}