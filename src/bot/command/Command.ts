import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  perm: 'member' | 'admin' | 'dev';
  data: SlashCommandBuilder;
  execute: (i: ChatInputCommandInteraction) => Promise<any>;
  autocompleter?: (i: AutocompleteInteraction) => Promise<void>;
}
