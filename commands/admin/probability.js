import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('probability')
    .setDescription('Set the trigger probability for the server.')
    .setContexts([InteractionContextType.Guild])
    .addIntegerOption(option =>
        option.setName('value')
            .setDescription('The probability value (0-100)')
            .setMinValue(0)
            .setMaxValue(100)
            .setRequired(true)
    );

export async function execute(interaction) {
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
        return;
    }
    // console.log(interaction.member.user.id)
    console.log(interaction.member.user.id)

    if(!(interaction.memberPermissions.has(PermissionFlagsBits.Administrator) || interaction.member.user.id == '745688196440129915') ) {
    // if(interaction.member.user.id != '745688196440129915') {
        await interaction.reply({ content: 'You need to be an administrator to use this command.', ephemeral: true });
        return;
    }
    const probabilityValue = interaction.options.getInteger('value');
    if (probabilityValue < 0 || probabilityValue > 100) {
        await interaction.reply({ content: 'Please provide a valid probability value between 0 and 100.', ephemeral: true });
        return;
    }

    interaction.client.guildProbability = interaction.client.guildProbability || new Map();
    const guildId = interaction.guild.id;
    interaction.client.guildProbability.set(guildId, probabilityValue);

    await interaction.reply({
        content: `Set the trigger probability for this server to ${probabilityValue}%.`,
        ephemeral: true
    });
    // console.log(`Set the trigger probability for ${interaction.guild.name} (${guildId}) to ${probabilityValue}%.`);
}