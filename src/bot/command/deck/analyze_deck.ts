import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { reply } from "../../../util/misc";
import { DB_Manager } from "../../database";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱분석')
    .setDescription('덱을 분석해줍니다.'),
  async execute(interaction) {
    reply(interaction, {
      embeds: [DB_Manager.decklist.analyze(interaction.client)],
    });
  },
} as Command;
