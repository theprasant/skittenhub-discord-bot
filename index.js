console.log('starting index.js');
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.get('/', (req, res) => {
	res.send('Hello World!');
});
app.get('/logs', (req, res) => {
	let logsText = fs.readFileSync('C:/Users/prasa/.pm2/logs/skittenhub-out.log', 'utf8');
	// res.send(`<pre>${logsText}</pre>`);
	res.send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Logs</title>
			<style>
				pre { white-space: pre-wrap; word-wrap: break-word; }
				body { font-family: Arial, sans-serif; }
			</style>
		</head>
		<body>
			<h1>Logs</h1>
			<pre>${logsText}</pre>
		</body>
		</html>
	`);
});

app.get('/logs/error', (req, res) => {
	let errorLogsText = fs.readFileSync('C:/Users/prasa/.pm2/logs/skittenhub-error.log', 'utf8');
	res.send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Error Logs</title>
			<style>
				pre { white-space: pre-wrap; word-wrap: break-word; }
				body { font-family: Arial, sans-serif; }
			</style>
		</head>
		<body>
			<h1>Error Logs</h1>
			<pre>${errorLogsText}</pre>
		</body>
		</html>
	`);
});

const token = process.env.DISCORD_BOT_TOKEN;

// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
// add all the intents in client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildMessageTyping,
		// GatewayIntentBits.GuildAutoModerationConfiguration,
		// GatewayIntentBits.GuildAutoModerationExecution,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks
	]
});

client.commands = new Collection();
client.textCommands = new Collection();
client.dcChannels = new Collection();
client.guildProbability = new Collection();
client.cooldowns = new Collection();

const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

console.log(`Loading commands from: ${foldersPath}`);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		// const filePath = join(commandsPath, file);
		// console.log(`Loading command file: ${filePath}`);
		const command = await import(`./commands/${folder}/${file}`);
		console.log(`Loaded command: ${command.data.name}`);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const allTextCommandsPath = join(__dirname, 'textCommands');
const textCommandFolders = readdirSync(allTextCommandsPath);

for (const folder of textCommandFolders) {
	const textCommandsPath = join(allTextCommandsPath, folder);
	const textCommandFiles = readdirSync(textCommandsPath).filter(file => file.endsWith('.js'));
	for (const file of textCommandFiles) {
		const command = await import(`./textCommands/${folder}/${file}`);
		console.log(`Loaded text command: ${command.data.name}`);
		if ('data' in command && 'execute' in command) {
			client.textCommands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The text command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const event = await import(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
		console.log(`Registered one-time event: ${event.name}`);
	} else {
		client.on(event.name, (...args) => event.execute(...args));
		console.log(`Registered event: ${event.name}`);
	}
}

client.login(token).then(() => {
	console.log('Bot is logged in and ready!');
	// delete process.env.DISCORD_BOT_TOKEN;
}).catch(err => {
	console.error('Failed to log in:', err);
});
app.listen(process.env.PORT || 3000, () => {
	console.log('Server is running on http://localhost:3000');
});

process.on('uncaughtException', (err) => {
	console.error('Global uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
	console.error('Global unhandled rejection:', err);
});