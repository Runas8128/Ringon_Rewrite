import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { DB_Manager } from "../../database";

export default {
  perm: 'dev',
  data: new SlashCommandBuilder()
    .setName('역사관체크')
    .setDescription('역사관 채널이 잘 잡혔는지 확인합니다.'),
  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply('서버에서만 이 명령어를 실행할 수 있습니다!');
      return;
    }
    DB_Manager.decklist.load_history(interaction.guild);
    await interaction.reply(`History Ch: ${DB_Manager.decklist.history}`);
  },
} as Command;
