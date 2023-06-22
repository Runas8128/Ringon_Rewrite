import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { DB_Manager } from "../../database";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('업데이트')
    .setDescription('DB를 다시 로드합니다.')
    .addStringOption(option => option
      .setName('db')
      .setDescription('업데이트할 DB를 선택해주세요.')
      .setRequired(true)
      .addChoices(
        { name: '감지', value: 'detect' },
        { name: '덱리', value: 'decklist' },
        { name: '카드', value: 'cards' },
      )),
  async execute(interaction) {
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setTitle('🔄 DB를 업데이트하는 중입니다')
        .setDescription('예상 시간: ~ 3분')],
    });
    const sync_start = Date.now();
    const dbName = interaction.options.getString('db', true);
    if (dbName === 'detect' || dbName === 'decklist' || dbName === 'cards')
      await DB_Manager.load(dbName);
    const sync_end = Date.now();
    interaction.editReply({
      embeds: [new EmbedBuilder()
        .setTitle('🔄 DB 업데이트 완료!')
        .setDescription(`소요 시간: ${(sync_end - sync_start) / 1000}초`),
      ],
    });
  },
} as Command;