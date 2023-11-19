import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { MongoDB } from "../../../util/mongodb";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드갯수')
    .setDescription('로드된 카드 갯수를 알려줍니다.'),
  async execute(interaction) {
    const cardCount = await MongoDB.cards.countDocuments();
    await interaction.reply(`현재 로드된 카드는 총 ${cardCount}개입니다.`);
  },
} as Command;
