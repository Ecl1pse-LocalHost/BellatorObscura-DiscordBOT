import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits, GuildMember, TextChannel, ChannelType, NewsChannel, VoiceBasedChannel } from 'discord.js';

// Say command data and handler
export const sayCommand = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message through the bot.')
    .addStringOption(option => 
      option
        .setName('message')
        .setDescription('The text string for the bot to post')
        .setRequired(true)
    )
    .addChannelOption(option => 
      option
        .setName('channel')
        .setDescription('The target channel (optional)')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Defer the reply immediately to prevent cooldown conflicts
    await interaction.deferReply({ ephemeral: true });

    // Check if user has administrator permissions
    const member = interaction.member as GuildMember;
    const hasAdmin = member.permissions.has(
      PermissionFlagsBits.Administrator
    );

    // Get admin IDs from environment variables
    const adminIds = process.env.ADMIN_IDS?.split(',') || [];
    const isAdmin = hasAdmin || adminIds.includes(interaction.user.id);

    if (!isAdmin) {
      await interaction.editReply({
        content: '❌ Unauthorized: You do not have permission to use this command. Only administrators can use the /say command.'
      });
      return;
    }

    // Get the message option
    const message = interaction.options.getString('message', true);

    // Get the channel option (defaults to current channel)
    const channelOption = interaction.options.getChannel('channel');
    const targetChannel = channelOption || interaction.channel;

    // Check if the channel is valid and text-based
    if (!targetChannel || 
        targetChannel.type === ChannelType.GuildCategory ||
        targetChannel.type === ChannelType.GuildDirectory ||
        targetChannel.type === ChannelType.GuildForum ||
        targetChannel.type === ChannelType.GuildMedia) {
      await interaction.editReply({
        content: '❌ Error: Invalid target channel specified. Please choose a text channel.'
      });
      return;
    }

    try {
      // Send the message to the target channel
      if ('send' in targetChannel) {
        await targetChannel.send(message);
      } else {
        await interaction.editReply({
          content: '❌ Error: The specified channel does not support sending messages.'
        });
        return;
      }

      // Edit the deferred reply with confirmation
      const channelName = channelOption 
        ? `in ${(targetChannel as TextChannel).name}` 
        : 'in this channel';
      
      await interaction.editReply({
        content: `✅ Message sent ${channelName}:\n\`${message}\``
      });
    } catch (error) {
      console.error('Error sending message:', error);
      await interaction.editReply({
        content: '❌ Error sending message. Please try again.'
      });
    }
  }
};