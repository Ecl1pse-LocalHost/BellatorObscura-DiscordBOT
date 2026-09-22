# Rules Screening Auto-Role Setup Guide

## Overview
This guide explains how to configure the automatic role assignment feature for users who complete Discord's built-in rules screening (member verification).

## Configuration Steps

### 1. Configure Target Role in `src/utils/autoRole.ts`

Edit the `src/utils/autoRole.ts` file and set either:

**Option A: Use Role ID (Recommended)**
```typescript
const TARGET_ROLE_ID = 'YOUR_TARGET_ROLE_ID_HERE'; // Replace with your actual role ID
const TARGET_ROLE_NAME = ''; // Leave empty when using ID
```

**Option B: Use Role Name (Easier but less reliable)**
```typescript
const TARGET_ROLE_ID = ''; // Leave empty when using name
const TARGET_ROLE_NAME = 'Member'; // Example: 'Member', 'Verified', etc.
```

**How to find Role ID:**
1. Enable Developer Mode in Discord:
   - Settings → Advanced → Developer Mode
2. Right-click the role in your server's member list
   - Select "Copy ID"
3. Paste the ID into `TARGET_ROLE_ID`

### 2. Enable Privileged Gateway Intents in Discord Developer Portal

**Important:** The Guild Members intent is a privileged intent that requires approval from Discord.

1. Go to: [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Select your bot application
3. Navigate to "Bot" section
4. Under "Privileged Gateway Intents", enable:
   - **SERVER MEMBERS INTENT** (required for detecting member updates)
5. Click "Save Changes"
6. **Request Approval**: Discord will review your request (usually approved within minutes to hours)

### 3. Ensure Bot Has Correct Permissions

The bot needs:
- **Manage Roles** permission in your server
- Role hierarchy higher than the target role you want to assign

**To set permissions:**
1. Go to Server Settings → Roles
2. Find your bot's role
3. Enable "Manage Roles" permission
4. Ensure the bot's role is above the target role in the hierarchy

### 4. Restart Your Bot

After making changes:
```bash
npm run build  # Compile TypeScript
npm start      # Start the bot
# or
npm run dev    # Start in development mode with watch
```

## Testing the Feature

1. Invite a new user to your server (they should see the rules screening)
2. Have them accept the rules
3. Check if they receive the target role automatically
4. Verify logs for any errors:
   - Look for "✅ Successfully assigned role" messages
   - Or "❌ Error assigning role" messages with details

## Troubleshooting

### Common Issues and Solutions

**Issue: Bot doesn't detect rules screening completion**
- ✅ Ensure Guild Members intent is enabled in Developer Portal
- ✅ Wait for Discord to approve the privileged intent
- ✅ Check that `GatewayIntentBits.GuildMembers` is in your intents

**Issue: Role not assigned**
- ✅ Verify bot has "Manage Roles" permission
- ✅ Check bot's role hierarchy (must be above target role)
- ✅ Confirm TARGET_ROLE_ID or TARGET_ROLE_NAME is correct
- ✅ Check console logs for error messages

**Issue: Getting "Missing Permissions" errors**
- ✅ Ensure bot has Manage Roles permission
- ✅ Verify bot's role is higher than target role in hierarchy
- ✅ Check that the role exists in the server

### Debugging Tips

Enable debug logging in `src/utils/autoRole.ts`:
```typescript
const DEBUG_LOGGING = true; // Set to false to disable
```

This will show detailed logs about:
- Member updates
- Pending status changes
- Role assignment attempts
- Permission checks

## Technical Details

### How It Works
1. Bot listens for `guildMemberUpdate` events
2. Compares old member state with new member state
3. Detects when `pending` status changes from `true` to `false`
4. Assigns configured role to the member
5. Handles permission errors gracefully

### Event Flow
```
Member joins → Sees rules screening → Accepts rules
    ↓
guildMemberUpdate event triggered
    ↓
handleMemberVerification() called
    ↓
Check if pending status changed
    ↓
Get target role from configuration
    ↓
Verify bot has permissions
    ↓
Assign role to member
    ↓
Log success or error
```

## Security Considerations

- The bot only assigns roles when members complete rules screening
- No manual intervention required
- Permission checks prevent role hierarchy issues
- Error handling prevents crashes from permission errors

## Advanced Configuration

### Multiple Roles
If you need to assign multiple roles, modify the `handleMemberVerification` function:
```typescript
async function handleMemberVerification(oldMember: any, newMember: any) {
  if (oldMember.pending && !newMember.pending) {
    const guild = newMember.guild;
    
    // Assign multiple roles
    const rolesToAssign = [
      await getTargetRole(guild, 'ROLE_ID_1'),
      await getTargetRole(guild, 'ROLE_ID_2')
    ];
    
    for (const role of rolesToAssign.filter(Boolean)) {
      await newMember.roles.add(role);
    }
  }
}
```

### Role Removal on Kick/Ban
You can also detect when members are removed:
```typescript
client.on('guildMemberRemove', async (member) => {
  console.log(`${member.user.tag} was removed from the guild`);
  // Add cleanup logic here if needed
});
```

## Support

For issues with this feature, check:
1. Console logs for error messages
2. Discord Developer Portal for intent approval status
3. Bot permissions in your server settings
4. Role hierarchy in your server settings