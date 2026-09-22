import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import { deployCommands } from './deploy-commands';
import { pingCommand } from './commands/ping';
import { purgeCommand } from './commands/purge';
import { sayCommand } from './commands/say';
import { getCooldownRemaining } from './utils/cooldown';
import { handleMemberVerification } from './utils/autoRole';

// Load environment variables
dotenv.config();

// Extend Client with commands property
interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers // Required for detecting member updates (rules screening)
  ]
}) as ExtendedClient;

// Collection to store commands
client.commands = new Collection();

// Register commands
client.commands.set('ping', pingCommand);
client.commands.set('purge', purgeCommand);
client.commands.set('say', sayCommand);

// Event: Client ready (using clientReady for v15 compatibility)
client.once('clientReady', async () => {
  console.log(`✅ Logged in as ${client.user?.tag}!`);

  // Deploy commands when the bot starts
  await deployCommands();
});

// Event: Interaction create (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ Command ${interaction.commandName} not found.`);
    return;
  }

  // Check cooldown for this command
  const cooldownRemaining = getCooldownRemaining(
    interaction.user.id,
    interaction.commandName
  );

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
  } catch (error) {
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
    await handleMemberVerification(oldMember, newMember);
  } catch (error) {
    console.error('❌ Error in guildMemberUpdate handler:', error);
  }
});

// Log in to Discord with the token from .env
client.login(process.env.DISCORD_TOKEN);