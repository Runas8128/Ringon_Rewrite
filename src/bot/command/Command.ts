import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export interface Command {
  perm: 'member' | 'admin' | 'dev';
  data: SlashCommandBuilder;
  execute: (i: ChatInputCommandInteraction) => Promise<any>;
  autocompleter?: (i: AutocompleteInteraction) => Promise<void>;
}
