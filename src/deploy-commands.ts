import { REST, Routes } from 'discord.js';
import { pingCommand } from './commands/ping';
import { purgeCommand } from './commands/purge';
import { sayCommand } from './commands/say';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const commands = [pingCommand.data, purgeCommand.data, sayCommand.data];

/**
 * Deploy commands to Discord
 */
export async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log('Starting command deployment...');

    // Check if GUILD_ID is set (for guild-specific deployment)
    const guildId = process.env.GUILD_ID;

    if (guildId) {
      // Deploy commands to a specific guild
      console.log(`Deploying commands to guild ${guildId}...`);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
        { body: commands }
      );
      console.log('✅ Successfully deployed commands to guild.');
    } else {
      // Deploy commands globally
      console.log('Deploying commands globally...');
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!),
        { body: commands }
      );
      console.log('✅ Successfully deployed commands globally.');
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}

// Allow running this file directly for manual deployment
if (require.main === module) {
  deployCommands();
}