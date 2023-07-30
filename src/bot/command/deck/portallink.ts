import axios from "axios";
import { ButtonStyle } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

interface Portal {
  data: { hash: string, errors: any[] };
}

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('포탈링크')
    .setDescription('유효한 덱 코드를 입력하면, 해당 포탈로 가는 링크를 제공합니다!')
    .addStringOption(option => option
      .setName('덱코드')
      .setDescription('포탈 링크를 만들 덱 코드입니다.')
      .setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply();
    const deck_code = interaction.options.getString('덱코드');

    const result: Portal = (await axios.get(
      `https://shadowverse-portal.com/api/v1/deck/import?format=json&deck_code=${deck_code}`)).data;

    if (result.data.errors.length > 0) {
      await interaction.reply('덱 코드가 무효하거나, 잘못 입력되었습니다. 다시 입력해 주세요!');
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('포탈 링크')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://shadowverse-portal.com/deck/${result.data.hash}?lang=ko`),
      );
    await interaction.reply({ components: [row] });
  },
} as Command;
