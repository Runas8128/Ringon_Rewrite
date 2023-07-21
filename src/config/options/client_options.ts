import { GatewayIntentBits, Partials } from 'discord.js';

export const intents : GatewayIntentBits[] = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
];

export const partials : Partials[] = [
  Partials.Reaction,
  Partials.Message,
];

export const isTesting : boolean = true;
export const select = <T>(prod: T, dev: T) => isTesting ? dev : prod;
