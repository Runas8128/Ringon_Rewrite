import { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { DB_Manager } from "../../../database";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('팩이름')
    .setDescription('현재 팩 이름을 변경합니다.')
    .addStringOption(option => option
      .setName('이름')
      .setDescription('새로운 팩의 이름입니다.')
      .setRequired(true)),
  async execute(interaction) {
    if (!interaction.channel || !interaction.guild) {
      await interaction.reply("팩이름 명령어는 서버의 텍스트 채널에서 사용해주세요!");
      return;
    }

    const embedWarn = new EmbedBuilder()
      .setTitle('⚠️ 해당 명령어 사용시, 현재 등록된 덱리가 모두 삭제됩니다.')
      .setDescription('사용하시려면 `확인`을 입력해주세요! 1분 후 자동으로 취소됩니다.');
    await interaction.reply({ embeds: [ embedWarn ] });

    const proceed = await check(interaction);
    if (!proceed) {
      interaction.editReply({ content: '팩 변경을 취소합니다.' });
      return;
    }

    const embedGranted = new EmbedBuilder()
      .setTitle('ℹ️ 승인되었습니다!')
      .setDescription(
        `덱리 초기화 및 팩이름 변경을 진행합니다.\n' +
        '예상 시간: ${DB_Manager.decklist.decklist.length / 10}초`
      );
    await interaction.followUp({ embeds: [ embedGranted ] });

    const b = Date.now();

    await DB_Manager.decklist.update_pack(
      interaction.options.getString('이름', true),
      interaction.guild,
    );

    const e = Date.now();

    const embedDone = new EmbedBuilder()
      .setTitle('ℹ️ 팩 이름 변경에 성공했습니다!')
      .setDescription(`소요 시간: ${(e - b) / 1000}초`);
    await interaction.followUp({ embeds: [ embedDone ] });
  },
} as Command;

async function check(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.channel!.awaitMessages({
      time: 60 * 1000,
      filter: msg => msg.author.id === interaction.user.id && msg.content === '확인',
    });
    return true;
  }
  catch (err) {
    return false;
  }
}
