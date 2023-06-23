import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('종료')
    .setDescription('봇을 강제종료합니다.'),
  async execute(interaction) {
    await interaction.reply('강제종료중...');
    interaction.client.destroy();
  },
} as Command;
