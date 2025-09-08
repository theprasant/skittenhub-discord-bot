import { REST, Routes } from 'discord.js';
import config from './config.json' with { type: "json" };
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import 'dotenv/config';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { clientId, guildId } = config;
const processArgs = process.argv;
const token = process.env.DISCORD_BOT_TOKEN;


if (!token) {
    console.error('No token found. Please set the DISCORD_BOT_TOKEN environment variable.');
    process.exit(1);
}

const commands = [];

const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
    
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
   
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(`./commands/${folder}/${file}`);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = processArgs[2]?.toLocaleLowerCase() == 'global'
            ? await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            )
            : await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();