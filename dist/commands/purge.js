"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeCommand = void 0;
const discord_js_1 = require("discord.js");
// Purge command data and handler
exports.purgeCommand = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk deletes messages in the current channel.')
        .addIntegerOption(option => option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(false)),
    async execute(interaction) {
        // Check if user has permission to manage messages or is an admin
        const member = interaction.member;
        const hasManageMessages = member.permissions.has(discord_js_1.PermissionFlagsBits.ManageMessages);
        // Get admin IDs from environment variables
        const adminIds = process.env.ADMIN_IDS?.split(',') || [];
        const isAdmin = adminIds.includes(interaction.user.id);
        if (!hasManageMessages && !isAdmin) {
            await interaction.reply({
                content: '❌ Unauthorized: You do not have permission to use this command.',
                ephemeral: true
            });
            return;
        }
        // Get the amount option (default to 100 if not provided)
        const amount = interaction.options.getInteger('amount') || 100;
        try {
            // Delete messages using bulkDelete
            // The `true` parameter filters out messages older than 14 days
            const channel = interaction.channel;
            const deleted = await channel.bulkDelete(amount, true);
            // Reply with confirmation (ephemeral)
            await interaction.reply({
                content: `✅ Successfully deleted ${deleted?.size || amount} messages.`,
                ephemeral: true
            });
        }
        catch (error) {
            console.error('Error deleting messages:', error);
            await interaction.reply({
                content: '❌ Error deleting messages. Please try again.',
                ephemeral: true
            });
        }
    }
};
