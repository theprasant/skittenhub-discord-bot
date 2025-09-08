import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('toggledc')
    .setDescription('Toggles the DC channel.')
    .setContexts([InteractionContextType.Guild])

    
export async function execute(interaction) {
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        return;
    }

    // console.log('interaction.member.user.id:', interaction.member.user.id);

    if(!(interaction.memberPermissions.has(PermissionFlagsBits.Administrator) || interaction.member.user.id == '745688196440129915') ) {
    // if(interaction.member.user.id != '745688196440129915') {
        await interaction.reply({ content: 'You need to be an administrator to use this command.', ephemeral: true });
        return;
    }

    console.log('interaction:', interaction);

    interaction.client.dcChannels = interaction.client.dcChannels || new Map();
    const channelId = interaction.channel.id;
    const isDcChannel = interaction.client.dcChannels.has(channelId);
    if (isDcChannel) {
        interaction.client.dcChannels.delete(channelId);
        await interaction.reply('Disabled the DC channel!');
    } else {
        interaction.client.dcChannels.set(channelId, true);
        setTimeout(() => {
            interaction.client.dcChannels.delete(channelId);
            console.log(`DC channel for ${interaction.guild.name} (${interaction.guild.id}) has been disabled after 2 minutes.`);
        }, 120000); // 2 minutes in milliseconds
        await interaction.reply('Enabled the DC channel for next 2 minutes!');
    }
}