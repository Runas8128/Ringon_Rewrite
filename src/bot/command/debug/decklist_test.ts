import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { DB_Manager } from "../../../database";

export default {
  perm: 'dev',
  data: new SlashCommandBuilder()
    .setName('덱리테스트')
    .setDescription('덱리DB주소가 잘 연결되어있는지 확인합니다.'),
  async execute(interaction) {
    await interaction.reply(DB_Manager.decklist.list_db.database_id);
  },
} as Command;
