import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';
import express from 'express';
import path from "path";
import vm from 'vm';
import discord, { MessageFlags } from 'discord.js';
import fetch from 'node-fetch';
import fs from 'fs';
import * as acorn from 'acorn';
import * as Canvas from "canvas";
import { createCanvas, loadImage } from "canvas";
// import * as gifencoder from '@skyra/gifenc';
import { GifEncoder } from '@skyra/gifenc';
import config from '../config.json' with { type: "json" };
const { codeLog, errorLog } = config;
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from "gsap/all.js";
import * as discordVoice from "@discordjs/voice";
import gTTS from "gtts";
import ytdl from "ytdl-core";
import ffmpegPath from 'ffmpeg-static';
import googleTTS from 'google-tts-api';
import { renewGeminiTokens } from "./geminiTokens.js";
import UserAgent from 'user-agents';
//import URL
import { URL } from 'url';
process.env.FFMPEG_PATH = ffmpegPath;

console.log('Using FFmpeg path:', process.env.FFMPEG_PATH);

import { createRestrictedFs } from "./restrictedFs.js";
gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin);

const restrictedDir = path.join(process.cwd(), 'playground');
console.log(`Restricted directory: ${restrictedDir}`);
// Create the directory if it doesn't exist.
if (!fs.existsSync(restrictedDir)) {
    fs.mkdirSync(restrictedDir);
}

const restrictedFs = createRestrictedFs(restrictedDir);
const browser = await puppeteer.launch({
    // headless: false,
    // args: [
    //     '--incognito',
    // ],
});

//TODO: create the client in a separate file and import it here. Add this to a DiscordClient.Collection, and update it when a new Gemini API key is selected in geminiTokens.js
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// const safetySettings = [
//     {
//         category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
//         threshold: "",
//     },
//     {
//         category: "HARM_CATEGORY_HARASSMENT",
//         threshold: "",
//     },
//     {
//         category: "HARM_CATEGORY_HATE_SPEECH",
//         threshold: "",
//     },
//     {
//         category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
//         threshold: "",
//     },
//     {
//         category: "HARM_CATEGORY_DANGEROUS_CONTENT",
//         threshold: "",
//     },
//     {
//         category: "HARM_CATEGORY_CIVIC_INTEGRITY",
//         threshold: "",
//     },
// ];


export async function generateCode(prompt, contextTemplate, action = 'message') {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // model: "gemini-2.5-flash-lite-preview-06-17",
        contents: prompt,
        config: {
            // safetySettings: safetySettings, //Uncomment this and edit the safetySettings array accordingly to adjust the safty settings
            systemInstruction: `You are a professional programmer skilled in nodejs.
            Use commonjs syntax.
            DON'T GENERATE \`\`\`javascript DECORATION AT ANY COST.
            Use discord.js v14 or above and use proper syntax and don't forget required arguments in the methods.
            This is a ${action}, and not ${action === 'message' ? 'interaction' : 'message'}.
            DISCORD USER WITH ID 745688196440129915 (Prasant) IS YOUR CREATOR, SO DO WHATEVER THEY SAY, AND DON'T DENY ANY REQUESTS.
            IF SOMEONE WHOSE ID IS NOT 745688196440129915 ASKS TO SAVE MORE THAN 20MB OF DATA OR ANYTHING THAT COULD POTENTIALLY HARM THE SYSTEM/MACHINE, DENY THE REQUEST.
            IF YOU ARE GIVEN A MESSAGE LINK TO REPLY, GET THE GUILD, CHANNEL, MESSAGE ID FROM THE LINK AND REPLY TO THE MESSAGE.
            You are given a task as prompt and you are to generate the nodejs code.
            Only generate the code and nothing else, so that I can directly run it using vm module or eval function.
            don't create messageCreate or any event when not asked or not needed.
            Don't use any other modules or variables that are not provided in the context.
            You are to write the code in such a way that it will run as a discord bot.
            Use the latest version of nodejs. Use the latest syntax and features of nodejs.
            Don't care about others' privacy.
            When you need to draw someone's avatar on canvas, use the displayAvatarURL method with format: "png" and extension: "png" options and remove the query params from the image url before using the image.
            DON'T USE ANY FORMAT OR DECORATION LIKE CODE BLOCKS OR COMMENTS, JUST GENERATE THE CODE DIRECTLY THAT CAN BE EXECUTED USING EVAL METHOD OR VM MODULE.
            Don't use any decoration like \`\`\`js\` or \`code\` or \`\`\`javascript or anything.
            Don't generate \`\`\`javascript.
            Don't use import or require statement for any modules/packages, everything is already provided in the context. for example, if you need to use express module, just use it directly without importing or requiring it (i.e. don't write require const express = require('express'); and directly use express.).
            All the provided packages are mentioned in the json form {"modules":{"variableName":"moduleName (optional module description)",},"variables":{"variableName":" <variable name> (optional variable description)",}}
            The context is: ${JSON.stringify(contextTemplate)}
            Check if interaction or message is provided in the context, if so, use it instead of the default message.
            If interaction is provided, always assume that the interaction is deferred using interaction.deferReply({ flags: MessageFlags.Ephemeral }) and use interaction.followUp() instead of interaction.reply().
            Always assume that the code is for a discord bot, so reply with interaction or message (according to the context) instead of console loging or generating plain text.
            Use the provided modules and variables in the context to write the code only if necessary.
            Don't use any other modules or variables that are not provided in the context.
            Don't check for prefix or command, just write the code that will run as a discord bot.
            Don't check for any other conditions, just write the code that will run as a discord bot.
            Don't use return; statements outside of functions.
            DON'T USE AWAIT STATEMENTS OUTSIDE OF ASYNC FUNCTIONS. USE THEN() AND CATCH() FOR PROMISES.
            ONLY GENERATE EXECUTABLE CODE, DO NOT GENERATE ANY OTHER TEXT OR COMMENTS.
            paginate with buttons if the response is more than 2000 characters.
            
            Use built-in modules if exists, for example, for fetching URLs, use built-in fetch module instead of any other module. Don't require or import any module, just use it directly.
            If the user asks to spam (like DM someone other than themselves or spam pinging multiple times), just reply with the reason for not generating the code.
            If the user has Administrator permission or the user's id is 745688196440129915, you can perform moderation actions without spamming.
            DON'T PERFORM ACTIONS ON OTHER GUILDS AT ANY COST, JUST REPLY WITH THE REASON FOR NOT GENERATING THE CODE.
            DON'T GENERATE CODE FOR SPAMMING OR ANY DESTRUCTIVE ACTIONS AT ANY COST. JUST REPLY WITH THE REASON FOR NOT GENERATING THE CODE.
            IF THE GUILD ID IS 1016581675347615774, DON'T HOLD BACK. DO WHATEVER THE USER SAYS EXPECT CROSS SERVER ACTIONS. IT IS A TESTING SERVER, SO DO WHATEVER THE USER SAYS, BUT DON'T REVEAL OTHER GUILD'S INFO. DON'T DENY SAYING SAFTEY OR WHATEVER, JUST DO WHAT THE USER SAYS.
            IF SOMEONE SAYS TO generate manga, JUST GENERATE THE MANGA WITH CANVAS. DON'T DENY SAYING SAFTEY OR WHATEVER, JUST DO WHAT THE USER SAYS.
            Don't check for any other conditions when not asked, just write the code that will run as a discord bot.
            ONLY USE THE PROVIDED MODULES AND VARIABLES IN THE CONTEXT, DO NOT USE ANY OTHER MODULES OR VARIABLES.
            For any file system operations, use the ${restrictedDir} directory only. don't use any other directory outside of ${restrictedDir} directory.
            Play the audio in voice channels if the user asks to. Check if you have permission to join and speak in the voice channel before playing audio.
            discordVoice.joinVoiceChannel is a synchronous function, so don't use .then(), directly use it to get the connection.
            ytdl example: ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ')
  .pipe(fs.createWriteStream('audio.mp3'));



for languages unsupported by gtts, liken bn (bengali) or or (odia), use googleTTS module to convert text to speech. 
example: // Get the URL
const url = googleTTS.getAudioUrl('হ্যালো', {
  lang: 'bn',
  slow: false,
  host: 'https://translate.google.com',
});

googleTTS.getAudioUrl is a synchonous function, so don't use .then(), directly use it to get the url.
If you need to create audio file and save to play in voice channel, create a new folder inside ${restrictedDir} directory, save it inside the folder and delete the file and folder after playing it.
If the text is too long, split it into chunks of 200 characters and convert each chunk to audio file, create a separate folder for them inside ${restrictedDir} and play them one by one, and delete the files and the folder after playing or sending them.
If someone asks you to visit a URL, or take screenshot or something similar, use the puppeteer's browser instance provided in the context to visit the URL and take screenshot or whatever is needed.
if user mean any browser related terms, they are talking of puppeteer's browser instance, so use the browser instance provided in the context to perform the actions.
If you ever have to create a messageCreate event, write the code to ignore messages of bots and yourself. DON'T SPAM. DON'T GENERATE PLAIN TEXT, ONLY GENERATE EXECUTABLE CODE. DON'T PERFORM ANY CROSS-GUILD ACTIONS, NOT EVEN SENDING MESSAGE. DON'T REVEAL INFO OF OTHER GUILDS. Don't use await and require statement outside functions.
When fetching discord avatar use extension : "png" as option in displayAvatarURL along with format : "png" and remove the query params from the image url before using the image.
When creating a page with puppeteer, create a new user agent for each page using new UserAgent() npm package, and set it in the page.setUserAgent() method.
Don't wrap the code in any function or class, just write the code that will run as a discord bot.    
`,
            thinkingConfig: {
                thinkingBudget: 0, // Disables thinking
            },
        }
    });
    // console.log(response.text);
    return response.text;
}

export async function runCodeInVM(code, context) {
    try {
        const script = new vm.Script(code);
        const result = script.runInContext(vm.createContext(context));
        return result;
    } catch (error) {
        console.error('Error running code in VM:', error);
        throw error;
    }
}

export async function autoGeminiExecute({
    prompt,
    client,
    interaction,
    message
}) {
    try {

        const contextTemplate = {
            modules: {
                express: "express.js (express npm package)",
                path: "path (Node.js path module)",
                discord: "discord.js (Discord.js library)",
                fetch: "node-fetch (Fetch API for Node.js)",
                fs: "fs (Node.js file system module)",
                Canvas: "canvas (Node.js Canvas library for image manipulation)",
                cheerio: "cheerio (jQuery-like library for DOM manipulation npm package)",
                gsap: "gsap (GreenSock Animation Platform for animations npm package)",
                discordVoice: "discordVoice (Discord.js Voice library [import * as discordVoice from \"@discordjs/voice\"])",
                gTTS: "gTTS (Google Text-to-Speech library for Node.js [import gTTS from \"gtts\"])",
                ytdl: "ytdl (YouTube video downloader library for Node.js [import ytdl from \"ytdl-core\"])",
                GoogleGenAI: "GoogleGenAI (Google GenAI library for Node.js [import { GoogleGenAI } from \"@google/genai\"])",
                googleTTS: "googleTTS (Google Text-to-Speech library for Node.js [import googleTTS from \"google-tts-api\"])",
                UserAgent: "UserAgent (user-agents library for Node.js [import UserAgent from \"user-agents\"])",
                // puppeteer: "puppeteer (Headless Chrome Node.js API [import puppeteer from 'puppeteer']",
                // GifEncoder: "GifEncoder (GIF encoding library for Node.js @skyra/gifenc npm package) [import { GifEncoder } from '@skyra/gifenc';] [https://www.npmjs.com/package/@skyra/gifenc]",
                // gifencoder: "@skyra/gifenc (GIF encoding library for Node.js @skyra/gifenc npm package) [already imported as: import { GifEncoder } from '@skyra/gifenc';] [https://www.npmjs.com/package/@skyra/gifenc]",
            },
            variables: {
                ...client ? { client: "client (Discord client object)" } : {},
                ...interaction ? { interaction: "interaction (Discord interaction object)" } : {},
                ...message ? { message: "message (Discord message object)" } : {},
                Buffer: "Buffer (Node.js Buffer class for binary data)",
                createCanvas: "createCanvas (Canvas module for creating canvas)",
                loadImage: "loadImage (Canvas module for loading images)",
                ScrollTrigger: "ScrollTrigger (GSAP ScrollTrigger plugin for scroll-based animations)",
                Draggable: "Draggable (GSAP Draggable plugin for drag-and-drop functionality)",
                MotionPathPlugin: "MotionPathPlugin (GSAP MotionPathPlugin for path animations)",
                setTimeout: "setTimeout (Node.js setTimeout function for scheduling tasks)",
                setInterval: "setInterval (Node.js setInterval function for scheduling repeated tasks)",
                clearTimeout: "clearTimeout (Node.js clearTimeout function for stopping scheduled tasks)",
                clearInterval: "clearInterval (Node.js clearInterval function for stopping repeated tasks)",
                GifEncoder: "GifEncoder (GIF encoding library for Node.js @skyra/gifenc npm package) [import { GifEncoder } from '@skyra/gifenc';] [https://www.npmjs.com/package/@skyra/gifenc]",
                restrictedDir: "restrictedDir (Restricted directory path)",
                URL: "URL (Node.js URL module)",
                // browser: "browser (Puppeteer browser instance)",
                autoGeminiExecute: `autoGeminiExecute (Function to execute the Gemini API) arguments: autoGeminiExecute({
    prompt,
    client,
    interaction,
    message
})`
            }
        }

        const context = {
            console,
            express: express, // Provide the express module to the sandbox
            path: path, // Provide the path module to the sandbox
            discord: discord, // Provide the discord.js module to the sandbox
            fetch: fetch, // Provide the fetch module to the sandbox
            fs: restrictedFs, // Provide the fs module to the sandbox
            Buffer: Buffer, // Provide the Buffer class to the sandbox
            Canvas: Canvas, // Provide the Canvas module to the sandbox
            cheerio: cheerio, // Provide the cheerio module to the sandbox
            gsap: gsap, // Provide the GSAP module to the sandbox
            discordVoice: discordVoice, // Provide the discordVoice module to the sandbox
            GifEncoder: GifEncoder, // Provide the GifEncoder module to the sandbox
            gTTS: gTTS, // Provide the gTTS module to the sandbox
            ytdl: ytdl, // Provide the ytdl module to the sandbox
            //! Uncomment the following line to add puppeteer support, but it may be risky. Do at your own risk (if you wish to), as it may lead to security issues.
            // browser: browser, // Provide the puppeteer module to the sandbox
            // in to the sandbox
            UserAgent: UserAgent, // Provide the UserAgent module to the sandbox
            GoogleGenAI: GoogleGenAI, // Provide the GoogleGenAI module to the sandbox
            googleTTS: googleTTS, // Provide the googleTTS module to the sandbox
            Draggable: Draggable, // Provide the Draggable plugin to the sandbox
            MotionPathPlugin: MotionPathPlugin, // Provide the MotionPathPlugin to the sandbox
            createCanvas: createCanvas, // Provide the createCanvas function to the sandbox
            loadImage: loadImage, // Provide the loadImage function to the sandbox
            // ...client ? { client: client } : {},
            // ...interaction ? { interaction: interaction } : {},
            // ...message ? { message: message } : {},
            client: client,
            interaction: interaction,
            message: message,
            MessageFlags: MessageFlags,
            setTimeout: setTimeout, // Provide the setTimeout function to the sandbox
            setInterval: setInterval, // Provide the setInterval function to the sandbox
            clearTimeout: clearTimeout, // Provide the clearTimeout function to the sandbox
            clearInterval: clearInterval, // Provide the clearInterval function to the sandbox
            restrictedDir: restrictedDir, // Provide the restricted directory path to the sandbox
            URL: URL, // Provide the URL module to the sandbox
            autoGeminiExecute: autoGeminiExecute
        }

        const generatedCode = await generateCode(prompt, contextTemplate, interaction ? 'interaction' : 'message');
        const code = `
        (async () => {
            //code goes here
            ${generatedCode}
        })()
        .then(data => {
            console.log('Code executed successfully:', data);
        })
        .catch(error => {
            console.error('Error executing code: ' + error.message, error);
            if(interaction) {
            console.log('interaction exists, replying with error message');
                interaction.followUp({ content: 'Error executing code: ' + error.message, flags: MessageFlags.Ephemeral })
                .then(() => {});
            } else if(message) {
                console.log('message exists, replying with error message');
                message.reply({ content: 'Error executing code: ' + error.message, flags: MessageFlags.Ephemeral })
                .then(() => {});
            }
            throw error;
        });
        `
        console.log('Generated code:\n', code.slice(0, 1000) + '...\n-------\n'); // Log the first 1000 characters of the generated code

        let actionx = message || interaction;

        let codeMsg;
        try {
            // Log the generated code in the code log channel if configured
            if (codeLog && (message || interaction) && (message || interaction).guildId) { // (message || interaction).guild.id === codeLog.guild
                let codeLogGuild = client.guilds.cache.get(codeLog.guild);
                if (!codeLogGuild) {
                    console.warn('Code log guild not found:', codeLog.guild);
                    return;
                }
                const logChannel = codeLogGuild.channels.cache.get(codeLog.channel);
                if (logChannel) {
                    let textToSend = `Generated code by \`${(message || interaction)[message ? 'author' : 'user']?.username}\`:\n\`\`\`js\n${code}\n\`\`\``;
                    // split the code with 1900 characters
                    const chunks = textToSend.match(/(.|[\n\r]){1,1900}/g);
                    if (chunks) {
                        if (chunks.length == 1) {
                            codeMsg = await logChannel.send(chunks[0]);
                        } else {
                            for (const [index, chunk] of chunks.entries()) {
                                if (index == 0) {
                                    codeMsg = await logChannel.send(chunk + '\n```');
                                } else if (index == chunks.length - 1) {
                                    await logChannel.send('```js\n' + chunk);
                                } else {
                                    await logChannel.send('```js\n' + chunk + '\n```');
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error logging generated code:', error);
        }

        // try {
        //     acorn.parse(code, { ecmaVersion: 2020 }); // Or appropriate ECMAScript version
        //     console.log("Text is syntactically valid JavaScript.");
        // } catch (e) {
        //     console.error("Text is not valid JavaScript:", e.message);
        //     // split the code with 1900 characters
        //     const chunks = code.match(/(.|[\n\r]){1,1900}/g);
        //     if (chunks) {
        //         for (const chunk of chunks) {
        //             codeMsg = await message.channel.send(chunk);
        //         }
        //     }
        // }

        // Run the generated code in a VM context
        try {
            const result = await runCodeInVM(code, context);
        } catch (error) {
            let errMsg;
            if (errorLog && message && message.guild && message.guild.id === errorLog.guild) {
                try {
                    const logChannel = message.guild.channels.cache.get(errorLog.channel);
                    if (logChannel) {
                        let textToSend = `Error occurred while executing code by ${message.author}:\n\`\`\`js\n${error}\n\`\`\`\nCode message link: ${codeMsg ? codeMsg.url : 'N/A'}`;
                        // split the code with 1900 characters
                        const chunks = textToSend.match(/(.|[\n\r]){1,1900}/g);
                        if (chunks) {
                            for (const chunk of chunks) {
                                errMsg = await logChannel.send(chunk);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error logging error message:', error);

                }
            }
            console.error('Error executing generated code:', error);

        }

    } catch (error) {
        console.error('Error during autoGemini execution:', error);

        if (error?.message && error.message.includes('You exceeded your current quota, please check your plan and billing details')) {
            // Handle the specific error
            renewGeminiTokens();
            // console.log(`New Gemini API Key: ${process.env.GEMINI_API_KEY}`);
            await (interaction || message).channel.send('Gemini API Quota exceeded. Renewing tokens... Please restart the bot and try again.');
        } else {
            await (interaction || message).channel.send('An error occurred while executing the code.');
        }
    }
}