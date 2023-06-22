import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('청소')
    .setDescription('최근 n개의 메시지를 삭제합니다.')
    .addIntegerOption(option => option
      .setName('갯수')
      .setDescription('삭제할 메시지 갯수입니다.')
      .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.channel;
    if (channel === null || channel.isDMBased()) return;
    channel.bulkDelete(interaction.options.getInteger('갯수', true))
      .then(() => interaction.reply({ content: 'Done!', ephemeral: true }));
  },
} as Command;
