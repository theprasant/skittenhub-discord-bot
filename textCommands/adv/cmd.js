import { autoGeminiExecute } from "../../helpers/autoGemini.js";
import config from "../../config.json" with { type: "json" };
const { allowedGuilds, developerId } = config;
export const data = {
    name: 'cmd',
    description: 'Executes a custom command',
    cooldown: 10, //seconds
};

export async function execute(message, args) {
    if (allowedGuilds.length && !allowedGuilds.includes(message.guild.id) && message.author.id !== developerId) {
        await message.reply('This command is not allowed in this server yet. Please wait, or contact the developer (username: `prasant`) to allow it.');
        return;
    }
    if(!args || args.length === 0) {
        await message.reply('Please provide a command to execute.');
        return;
    }
    const command = args.join(' ');
    // await message.reply(`Executing command: ${command}`);
    try {
        await autoGeminiExecute({
            prompt: command,
            message: message,
            client: message.client
        })
    } catch (error) {
        console.error('Error executing command:', error);
        await message.reply('An error occurred while executing the command.');
    }
}