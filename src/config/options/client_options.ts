import { GatewayIntentsString, Partials } from 'discord.js';

export const intents : GatewayIntentsString[] = [
  "Guilds",
  "GuildMessages",
  "GuildMembers",
  "GuildMessageReactions",
  "MessageContent",
];

export const partials : Partials[] = [
  Partials.Reaction,
  Partials.Message,
];

export const isTesting : boolean = false;
export const select = <T>(prod: T, dev: T) => isTesting ? dev : prod;
