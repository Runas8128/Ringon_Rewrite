import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { DeckList } from "../../../database";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  async execute(interaction) {
    const analyzeResult = await DeckList.analyze(interaction.client);
    await interaction.reply({ embeds: [ analyzeResult ] });
  },
} as Command;
