"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const deploy_commands_1 = require("./deploy-commands");
const ping_1 = require("./commands/ping");
const purge_1 = require("./commands/purge");
const say_1 = require("./commands/say");
const cooldown_1 = require("./utils/cooldown");
const autoRole_1 = require("./utils/autoRole");
// Load environment variables
dotenv_1.default.config();
// Create a new client instance
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMembers // Required for detecting member updates (rules screening)
    ]
});
// Collection to store commands
client.commands = new discord_js_1.Collection();
// Register commands
client.commands.set('ping', ping_1.pingCommand);
client.commands.set('purge', purge_1.purgeCommand);
client.commands.set('say', say_1.sayCommand);
// Event: Client ready (using clientReady for v15 compatibility)
client.once('clientReady', async () => {
    console.log(`✅ Logged in as ${client.user?.tag}!`);
    // Deploy commands when the bot starts
    await (0, deploy_commands_1.deployCommands)();
});
// Event: Interaction create (slash commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`❌ Command ${interaction.commandName} not found.`);
        return;
    }
    // Check cooldown for this command
    const cooldownRemaining = (0, cooldown_1.getCooldownRemaining)(interaction.user.id, interaction.commandName);
    if (cooldownRemaining > 0) {
        await interaction.reply({
            content: `⏳ Please wait ${cooldownRemaining} more second(s) before using this command again.`,
            ephemeral: true
        });
        return;
    }
    try {
        // Execute the command
        await command.execute(interaction);
    }
    catch (error) {
        console.error(`❌ Error executing ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
});
// Event: Guild member update (for rules screening detection)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        await (0, autoRole_1.handleMemberVerification)(oldMember, newMember);
    }
    catch (error) {
        console.error('❌ Error in guildMemberUpdate handler:', error);
    }
});
// Log in to Discord with the token from .env
client.login(process.env.DISCORD_TOKEN);
