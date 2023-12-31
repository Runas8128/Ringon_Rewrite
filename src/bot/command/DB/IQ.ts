import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { Detect } from "../../../database";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('능지')
    .setDescription('링곤이가 배운 단어들이 몇 개인지 알려줍니다.'),
  async execute(interaction) {
    await interaction.reply(`링곤 사전을 보니, 저의 아이큐는 ${Detect.get_length()}이라고 하네요!`);
  },
} as Command;
