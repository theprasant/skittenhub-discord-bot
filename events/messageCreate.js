import { Events, MessageFlags } from 'discord.js';
import { getResponce } from '../helpers/gemini.js';
import { getRandomBooleanWithChance } from '../helpers/getBool.js';
import config from '../config.json' with {type: 'json'};
const { prefix } = config;
export const name = Events.MessageCreate;
export async function execute(message) {
    // console.log(`Message received: ${message.author}`);
    if (!message.guild || message.author.bot) return;
    if(message.author.id === message.client.user.id) return; // Ignore messages from the bot itself
    //also add cooldown from command.data.cooldown (seconds)
    try {
        if (message.content.startsWith(prefix.toLocaleLowerCase())) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            if (message.client.textCommands?.has(commandName)) {
                const command = message.client.textCommands.get(commandName);
                if (command) {
                    try {
                        // Check if the command has a cooldown
                        if (command.data.cooldown) {
                            const now = Date.now();
                            const cooldownAmount = command.data.cooldown * 1000; // Convert seconds to milliseconds
                            const timestamps = message.client.cooldowns.get(command.name) || new Map();

                            if (timestamps.has(message.author.id)) {
                                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                                if (now < expirationTime) {
                                    const timeLeft = Math.round((expirationTime - now) / 1000);
                                    return await message.reply({ content: `Please wait ${timeLeft} more second(s) before reusing the \`${commandName}\` command.`, flags: MessageFlags.Ephemeral });
                                }
                            }

                            // Set the cooldown for the user
                            timestamps.set(message.author.id, now);
                            message.client.cooldowns.set(command.name, timestamps);
                        }
                        await command.execute(message, args);
                    } catch (error) {
                        console.error(`Error executing command ${commandName}:`, error);
                        await message.reply({ content: 'There was an error executing that command.', allowedMentions: { repliedUser: false } });
                    }
                }
                return;
            } 
            // else if (message.client.textCommands.has(commandName)) {
            //     const textCommand = message.client.textCommands.get(commandName);
            //     if (textCommand) {
            //         await textCommand.execute(message, args);
            //     }
            //     return;
            // }
        }
        message.client.dcChannels = message.client.dcChannels || new Map();
        const isDcChannel = message.client.dcChannels.has(message.channel.id);

        let content = message.content;
        if (!isDcChannel
            && (content.length < 20
                || (content.length < 40 && /<@&?\d+>/.test(content)))) return;

        const probability = message.client.guildProbability.get(message.guild.id) || 2;

        let boolIs = getRandomBooleanWithChance(isDcChannel ? 100 : probability);
        // console.log(`Random boolean (4% chance): ${boolIs}`);
        if (boolIs) {
            let last30messages = await message.channel.messages.fetch({ limit: 30 });
            last30messages = last30messages.filter(msg => !msg.author.bot && msg.id !== message.id && msg.content.trim() !== '');
            const historyInJson = last30messages.map(msg => ({
               [message.author.globalName]: msg.content,
            })).reverse()
            const response = await getResponce(content, historyInJson);
            await message.reply({ content: response, allowedMentions: { repliedUser: false } });
        }
    } catch (error) {
        console.error(error);
    }
}