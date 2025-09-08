import fs from 'fs';
import 'dotenv/config';

let geminiTokensText = fs.readFileSync('.gemini.env', 'utf8');
// console.log('Gemini Tokens Text:', geminiTokensText);

export function renewGeminiTokens() {
    let envText = `DISCORD_BOT_TOKEN=${process.env.DISCORD_BOT_TOKEN}\n`;

    const geminiTokens = geminiTokensText.split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split('#')[0]?.trim());
    const currentTokenIndex = geminiTokens.indexOf(process.env.GEMINI_API_KEY);
    process.env.GEMINI_API_KEY = geminiTokens[(currentTokenIndex + 1) % geminiTokens.length].split('#')[0]?.trim();
    envText += `GEMINI_API_KEY=${process.env.GEMINI_API_KEY}\n`;
    fs.writeFileSync('.env', envText);
}