"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCooldownRemaining = getCooldownRemaining;
const discord_js_1 = require("discord.js");
// In-memory rate limiter
const cooldowns = new discord_js_1.Collection();
/**
 * Check if a user is on cooldown for a specific command
 * @param userId - The user's ID
 * @param commandName - The command name
 * @returns The remaining cooldown time in seconds, or 0 if not on cooldown
 */
function getCooldownRemaining(userId, commandName) {
    // Default cooldown: 3 seconds per command per user
    const DEFAULT_COOLDOWN = 3;
    // Initialize collection for this command if it doesn't exist
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new discord_js_1.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    // Check if user is on cooldown
    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + DEFAULT_COOLDOWN * 1000;
        const timeLeft = (expirationTime - now) / 1000; // Convert to seconds
        if (timeLeft > 0) {
            return Math.ceil(timeLeft); // Round up to nearest second
        }
    }
    // User is not on cooldown, set new cooldown
    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), DEFAULT_COOLDOWN * 1000);
    return 0;
}
