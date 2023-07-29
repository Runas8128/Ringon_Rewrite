import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js";

export async function reply(interaction: ChatInputCommandInteraction, msg: string | MessagePayload | InteractionReplyOptions) {
  try {
    await interaction.reply(msg);
  }
  catch (e) {
    await interaction.editReply(msg);
  }
}

export function timer(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
