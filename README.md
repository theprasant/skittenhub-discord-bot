# SkittenHub Discord Bot

SkittenHub is an AI-powered Discord bot that automates tasks and enhances your server experience using the Gemini API. It acts as an intelligent agent, capable of responding to commands, managing server events, and integrating with Google Gemini for advanced features.

> Note: There is a risk of bot making irreversible changes like (but not limited to) deleting all the channels of a server, banning everyone and more, so please adjust the bot's permission accordingly. There's even cross server privacy leak,  so add the bot only to the servers where where you won't regret even if it got deleted or the members list is exposed.

## Features
- **AI Automation**: Uses Gemini API for smart actions and responses. (use `.s cmd <query/instruction>`)
- **Auto Reply**: replies to messages at random while trolling them. set probability to 0 if you want to disable them. (resets on server restart)
- **Token Management**: Automated Gemini API key rotation for reliability.
- **Express Web Server**: Provides endpoints for viewing bot logs and errors via a browser.


## Installation

### Prerequisites
- Node.js v18+
- npm (comes with Node.js)
- Discord bot token
- Gemini API key(s)

### Steps
1. **Clone the repository**
	 ```pwsh
	 git clone https://github.com/theprasant/skittenhub-discord.git
	 cd skittenhub-discord
	 ```
2. **Install dependencies**
	 ```pwsh
	 npm install
	 ```
3. **Configure environment variables**
	- Create `.env` and `.gemini.env` files at the root directory of the project.
	- Copy your Discord bot token and Gemini API key(s) into `.env` and `.gemini.env` files:
		 - `.env`:
			 ```
			 DISCORD_BOT_TOKEN=your_discord_token
			 GEMINI_API_KEY=your_gemini_api_key
			 ```
		 - `.gemini.env`:
			 ```
			 your_gemini_api_key_1 #optional comment
			 your_gemini_api_key_2 #optional comment
			 ...
			 ```
	> Example at `.example.env` and `.example.gemini.env` files.
4. **Configs**
	- Update the prefix, and IDs in the `config.json` file.
	- `clientId`: The bot's ID
	- `guildId`: Your server ID (required only if you want to deploy the slash commands only in your server)
	- `codeLog` and `errorLog`: guild and channel ID for logging the generated coode and errors respectively
	- `allowedGuilds`: List of IDs of guilds you allow to use the `.s cmd` and `/cmd` command. Set `allowedGuilds` as an empty array to allow in all guilds.
	- Create a new folder with name `playground` at the root of the project. It will be used to store temporary files. (risky, optional, only add if your use case needs it and the bot doesn't have too many users)
5. **Deploy the bot**
	- To deploy globally:
	```pwsh
	npm run deploy
	```
	- To deploy in only in your guild: (Add you guild/server ID as `guildId` in `config.json`)
	```pwsh
	npm run deploylocal
	```
4. **Start the bot**
	 - Development mode (auto-restart):
		 ```pwsh
		 npm run dev
		 ```
	 - Production mode:
		 ```pwsh
		 npm start
		 ```
	 - With PM2 (process manager):
		 ```pwsh
		 npm run pm2dev
		 # or
		 npm run pm2start
		 ```

## Usage
- Invite the bot to your Discord server.
- Use slash commands or text commands as defined in `commands/` and `textCommands/`.
- `.s cmd <your query>` for the main dish of this bot.
- example: `.s cmd play a number guessing game with me`
- Access bot logs in your browser at `http://localhost:3000/logs` and `http://localhost:3000/logs/error`. (You can just check your console, but if you want the bot to be able to access the logs, you'll need that)

## Adding Commands & Events
- **Commands**: Add new command files to `commands/<category>/` (for slash commands) or `textCommands/<category>/` (for text commands). Each command should export `data` and `execute` properties.
- **Events**: Add new event files to `events/` and export `name`, `execute`, and optionally `once`.
- **Helpers**: Utility functions and Gemini API logic go in `helpers/`.

## Contributing
1. Fork the repository and create your branch.
2. Add your feature or fix, following the existing code style.
3. Test your changes locally (`npm run dev`).
4. Submit a pull request with a clear description.

### Guidelines
- Use ES modules (`import/export`).
- Keep commands and events modular.
- Document new features in the README.
- Sensitive tokens should **never** be committed.

## License
ISC

## Issues & Support
- [GitHub Issues](https://github.com/theprasant/skittenhub-discord/issues)
- For questions, open an issue.
