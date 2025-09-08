import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { autoGeminiExecute } from "../../helpers/autoGemini.js";
import config from "../../config.json" with { type: "json" };
const { allowedGuilds, developerId } = config;

export const data = new SlashCommandBuilder()
    .setName('cmd')
    .setDescription('Executes a custom command')
    .addStringOption(option =>
        option.setName('input')
            .setDescription('The command to execute')
            .setRequired(true));

export async function execute(interaction) {
    // console.log('interaction:', interaction);
    if (allowedGuilds.length && !allowedGuilds.includes(interaction.guildId) && interaction.user.id !== developerId) {
        await interaction.reply({
            content: 'This command is not allowed in this server yet. Please wait, or contact the developer (username: `prasant`) to allow it.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const command = interaction.options.getString('input');
    if (!command || command.length === 0) {
        await interaction.reply({
            content: 'Please provide a command to execute.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.followUp({ content: 'Executing command...' });
        await autoGeminiExecute({
            prompt: command,
            interaction: interaction,
            client: interaction.client
        });
    } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({
            content: 'An error occurred while executing the command.',
            flags: MessageFlags.Ephemeral
        });
    }
}



/**
import { autoGeminiExecute } from "../../helpers/autoGemini.js";
import config from "../../config.json" assert { type: "json" };
const { allowedGuilds } = config;
export const data = {
    name: 'cmd',
    description: 'Executes a custom command',
    cooldown: 10, //seconds
};

export async function execute(message, args) {
    if (!allowedGuilds.includes(message.guild.id)) {
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
 */