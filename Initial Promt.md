Build a complete Discord bot in TypeScript using `discord.js` v14 and `dotenv`. 

**PROJECT DIRECTIVES**
- This is a private, solo project. Do NOT generate example files (e.g., `.env.example`), setup reminders, sharing guides, or any extra documentation intended for humans. Output only the exact commands and code required.

# PROJECT REQUIREMENTS & ENVIRONMENT
- Operating System: Windows 11 (running in Git Bash)
- Language: TypeScript
- Execution tool: `tsx`
- Dependencies to include: `discord.js`, `dotenv`
- Dev dependencies: `typescript`, `@types/node`, `tsx`

# FILE STRUCTURE
Create the following directory structure:
- `src/index.ts` (Bot entry point & client initialization)
- `src/deploy-commands.ts` (Auto-deploys commands on launch or via script)
- `src/commands/ping.ts` (Ping command module)
- `src/commands/purge.ts` (Purge command module)
- `src/utils/cooldown.ts` (In-memory rate limiter)
- `.env` (Environment variables file)
- `tsconfig.json` (Standard Node/TypeScript config)
- `package.json`

# SPECIFICATIONS & FEATURES

1. Configuration (`.env`):
   Create `.env` containing:
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_bot_application_client_id
   GUILD_ID=your_test_server_id_optional
   ADMIN_IDS=123456789012345678,987654321098765432

2. Anti-Spam Rate Limiter (`src/utils/cooldown.ts`):
   - Implement an in-memory `Collection` rate-limiter.
   - Set a default cooldown of 3 seconds per command per user.
   - If a user triggers a command before the cooldown expires, reply with an ephemeral message stating how many seconds they must wait.

3. Ping Command (`src/commands/ping.ts`):
   - Slash command name: `ping`
   - Description: "Replies with Pong! and latency."
   - Usable by: Anyone.
   - Behavior: Calculates API latency (difference between interaction timestamp and response) and WebSocket ping.
   - Self-Destruct: Automatically deletes its own response after 5 seconds (`setTimeout` calling `interaction.deleteReply()`).

4. Purge Command (`src/commands/purge.ts`):
   - Slash command name: `purge`
   - Description: "Bulk deletes messages in the current channel."
   - Options: Accepts an optional `amount` integer (Min: 1, Max: 100, Default: 100).
   - Security / Permissions:
     - Set `.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)`.
     - Also check if the executing `user.id` is in the `ADMIN_IDS` comma-separated list in `.env` OR has the `Administrator` permission. If not, reply with an ephemeral "Unauthorized" message.
   - Behavior: Deletes up to `amount` messages using `channel.bulkDelete(amount, true)`. The `true` parameter filters out messages older than 14 days to prevent API crashes.
   - Reply with an ephemeral confirmation message stating how many messages were successfully removed.

5. Command Deployment (`src/deploy-commands.ts`):
   - Export a `deployCommands()` function using `REST` and `Routes` from `discord.js`.
   - If `GUILD_ID` is present in `.env`, register commands instantly to that guild.
   - If `GUILD_ID` is empty, register commands globally.

6. Bot Startup (`src/index.ts`):
   - Initialize the `Client` with required intents (`GatewayIntentBits.Guilds`, `GatewayIntentBits.GuildMessages`).
   - Run `deployCommands()` automatically when the client logs in (`ready` event).
   - Set up an `interactionCreate` listener to route commands to `ping.ts` or `purge.ts` while enforcing the rate-limiter.

# STEP-BY-STEP EXECUTION
1. Initialize `package.json` and install all required dependencies using `npm`.
2. Create `tsconfig.json`.
3. Build the core utility files, commands, and `deploy-commands.ts`.
4. Assemble `src/index.ts`.
5. Keep terminal commands simple and use standard POSIX / Git Bash commands.