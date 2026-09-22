"use strict";
// Configuration for automatic role assignment
// Change these values to match your server's settings
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMemberVerification = handleMemberVerification;
// Target Role ID - The role to assign when users complete rules screening
const TARGET_ROLE_ID = '1545906885318680656';
// Log level for debugging
const DEBUG_LOGGING = true;
// Function to get the target role from a guild
async function getTargetRole(guild) {
    let targetRole = null;
    if (TARGET_ROLE_ID && TARGET_ROLE_ID.length > 5) {
        // Try to find role by ID first
        targetRole = guild.roles.cache.get(TARGET_ROLE_ID);
        if (targetRole) {
            if (DEBUG_LOGGING)
                console.log(`✅ Found target role by ID: ${targetRole.name} (${TARGET_ROLE_ID})`);
            return targetRole;
        }
    }
    console.error('❌ Target role not found! Please configure TARGET_ROLE_ID in src/utils/autoRole.ts');
    return null;
}
// Function to check if bot can assign the role
function canAssignRole(botMember, targetRole) {
    // Check if bot has Manage Roles permission
    if (!botMember.permissions.has('ManageRoles')) {
        console.error('❌ Bot does not have ManageRoles permission in this guild');
        return false;
    }
    // Check if bot's role is higher than target role in hierarchy
    if (targetRole.position >= botMember.roles.highest.position) {
        console.error(`❌ Bot's role (${botMember.roles.highest.name}) is not high enough to assign ${targetRole.name}`);
        return false;
    }
    return true;
}
// Main function to handle member verification
async function handleMemberVerification(oldMember, newMember) {
    if (DEBUG_LOGGING) {
        console.log(`🔄 Member updated: ${newMember.user.tag} (${newMember.id})`);
        console.log(`   Pending status: ${oldMember.pending} → ${newMember.pending}`);
    }
    // Check if member was pending and is no longer pending
    if (oldMember.pending && !newMember.pending) {
        if (DEBUG_LOGGING)
            console.log('🎉 Member completed rules screening!');
        const guild = newMember.guild;
        const botMember = guild.members.me; // Get bot's own member object
        // Get the target role
        const targetRole = await getTargetRole(guild);
        if (!targetRole) {
            return; // Role not configured or found
        }
        // Check if we can assign the role
        if (!canAssignRole(botMember, targetRole)) {
            return; // Bot lacks permissions
        }
        try {
            // Assign the role to the member
            await newMember.roles.add(targetRole);
            if (DEBUG_LOGGING) {
                console.log(`✅ Successfully assigned role ${targetRole.name} to ${newMember.user.tag}`);
            }
        }
        catch (error) {
            console.error(`❌ Error assigning role to ${newMember.user.tag}:`, error.message);
            // Handle specific errors
            if (error.code === 50013) {
                console.error('   → Missing permissions or role hierarchy issue');
            }
            else if (error.code === 10007) {
                console.error('   → Role not found in guild');
            }
            else if (error.code === 10002) {
                console.error('   → Unknown interaction');
            }
        }
    }
}
