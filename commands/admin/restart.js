import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import pm2 from 'pm2';

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart the bot.')
    .setContexts([InteractionContextType.Guild]);

export async function execute(interaction) {
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        return;
    }

    if(!(interaction.memberPermissions.has(PermissionFlagsBits.Administrator) || interaction.member.user.id == '745688196440129915') ) {
    // if(interaction.member.user.id != '745688196440129915') {
        await interaction.reply({ content: 'You need to be an administrator to use this command.', ephemeral: true });
        return;
    }
    await interaction.reply({ content: 'Restarting the bot...', ephemeral: true });
    process.exit(0);
    // pm2.connect((err) => {
    //     if (err) {
    //         console.error('PM2 connection error:', err);
    //         return;
    //     }
    //     pm2.restart('skittenhub', (err) => {
    //         if (err) {
    //             console.error('PM2 restart error:', err);
    //             interaction.followUp({ content: 'Failed to restart the bot.', ephemeral: true });
    //             return;
    //         }
    //         interaction.followUp({ content: 'Bot is restarting...', ephemeral: true });
    //     });
    // });

    
}