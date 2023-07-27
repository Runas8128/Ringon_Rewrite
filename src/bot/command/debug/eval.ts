import { transpile } from "typescript";
import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";

export default {
  perm: 'dev',
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('ts 코드를 실행합니다.')
    .addStringOption(op => op
      .setName('code')
      .setDescription('실행시킬 코드입니다. `interaction` 변수를 사용할 수 있습니다.')
      .setRequired(true)
    ),
  async execute(interaction) {
    const code = interaction.options.getString('code', true);
    await interaction.reply(eval(transpile(code)));
  },
} as Command;
