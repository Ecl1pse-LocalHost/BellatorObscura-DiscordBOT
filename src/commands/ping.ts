import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

// Ping command data and handler
export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! and latency.'),

  async execute(interaction: ChatInputCommandInteraction) {
    // Calculate API latency (difference between interaction timestamp and response)
    const apiLatency = Date.now() - interaction.createdTimestamp;
    
    // Get WebSocket ping
    const wsPing = Math.round(interaction.client.ws.ping);

    // Reply with latency information
    await interaction.reply({
      content: `🏓 Pong!\nAPI Latency: ${apiLatency}ms\nWebSocket Ping: ${wsPing}ms`,
      ephemeral: false
    });

    // Self-destruct: delete the response after 5 seconds
    setTimeout(() => {
      interaction.deleteReply().catch(error => {
        console.error('Error deleting ping message:', error);
      });
    }, 5000);
  }
};