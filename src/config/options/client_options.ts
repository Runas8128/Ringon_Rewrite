import { GatewayIntentBits, Partials } from 'discord.js';

export const client_options = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Reaction,
    Partials.Message,
  ],
}

export const isTesting : boolean = true;
export const select = <T>(prod: T, dev: T) => isTesting ? dev : prod;
