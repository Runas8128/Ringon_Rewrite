import { MessageContextMenuCommandInteraction } from "discord.js";

export interface MessageCommand {
  name: string;
  execute: (i: MessageContextMenuCommandInteraction) => Promise<any>;
}
