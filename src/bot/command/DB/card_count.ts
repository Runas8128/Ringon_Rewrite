import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { DB_Manager } from "../../database";
import { reply } from "../../../util/misc";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드갯수')
    .setDescription('로드된 카드 갯수를 알려줍니다.'),
  async execute(interaction) {
    reply(interaction, `현재 로드된 카드는 총 ${DB_Manager.cards.cards.length}개입니다.`);
  },
} as Command;
