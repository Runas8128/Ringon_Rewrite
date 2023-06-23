import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { DB_Manager } from "../../database";
import { reply } from "../../../util/misc";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('능지')
    .setDescription('링곤이가 배운 단어들이 몇 개인지 알려줍니다.'),
  async execute(interaction) {
    const count = DB_Manager.detect.full.length + new Set(DB_Manager.detect.prob.map(obj => obj.target)).size;
    await reply(interaction, `링곤 사전을 보니, 저의 아이큐는 ${count}이라고 하네요!`);
  },
} as Command;
