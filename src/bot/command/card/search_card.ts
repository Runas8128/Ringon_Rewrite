import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import CardView from "../../view/CardView";
import { Cards } from "../../../database";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('카드검색')
    .setDescription('카드를 검색해옵니다.')
    .addStringOption(option => option
      .setName('키워드')
      .setDescription('검색할 카드의 키워드입니다.')
      .setRequired(true)
      .setAutocomplete(true)),
  async execute(interaction) {
    await interaction.deferReply();

    const keyword = interaction.options.getString('키워드', true);
    const list = await Cards.search_card(keyword);

    await interaction.editReply(new CardView(list).get_updated_msg());
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name != '키워드') return;

    const result = (await Cards.search_card(focusdVar.value))
      .map(c => ({ name: c.name, value: c.name }))
      .slice(0, 25);
    if (result.length > 0) await interaction.respond(result);
  },
} as Command;
