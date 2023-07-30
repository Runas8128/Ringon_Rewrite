import { transpile } from "typescript";

import { SlashCommandBuilder } from "@discordjs/builders";

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
    await interaction.reply('evaluating...');
    const code = interaction.options.getString('code', true);
    const raw = eval(transpile(code));
    const result = await Promise.resolve(raw);
    await interaction.editReply(`\`\`\`js\n${result} \`\`\``);
  },
} as Command;
