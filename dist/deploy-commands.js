"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployCommands = deployCommands;
const discord_js_1 = require("discord.js");
const ping_1 = require("./commands/ping");
const purge_1 = require("./commands/purge");
const say_1 = require("./commands/say");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const commands = [ping_1.pingCommand.data, purge_1.purgeCommand.data, say_1.sayCommand.data];
/**
 * Deploy commands to Discord
 */
async function deployCommands() {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Starting command deployment...');
        // Check if GUILD_ID is set (for guild-specific deployment)
        const guildId = process.env.GUILD_ID;
        if (guildId) {
            // Deploy commands to a specific guild
            console.log(`Deploying commands to guild ${guildId}...`);
            await rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
            console.log('✅ Successfully deployed commands to guild.');
        }
        else {
            // Deploy commands globally
            console.log('Deploying commands globally...');
            await rest.put(discord_js_1.Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            console.log('✅ Successfully deployed commands globally.');
        }
    }
    catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}
// Allow running this file directly for manual deployment
if (require.main === module) {
    deployCommands();
}
