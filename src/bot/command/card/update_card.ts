import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { DB_Manager } from "../../../database";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('포탈업뎃')
    .setDescription('카드DB를 업데이트합니다.'),
  async execute(interaction) {
    await interaction.reply('🔄 카드 DB를 업데이트하는 중입니다.');
    await DB_Manager.cards.load();

    try {
      await interaction.editReply('카드 DB 업데이트가 끝났습니다!')
    } catch (err) {
      await interaction.channel?.send('카드 DB 업데이트가 끝났습니다!');
    }
  },
} as Command;
