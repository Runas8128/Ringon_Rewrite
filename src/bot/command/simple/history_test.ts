import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { DB_Manager } from "../../database";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('역사관체크')
    .setDescription('역사관 채널이 잘 잡혔는지 확인합니다.'),
  async execute(interaction) {
    await interaction.reply(`History Ch: ${DB_Manager.decklist.history}`);
  },
} as Command;
