import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { deckManager } from "../../../util/deckManager";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [await deckManager.analyze(interaction.client)],
    });
  },
} as Command;
