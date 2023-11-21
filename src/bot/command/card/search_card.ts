import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import CardView from "../../view/CardView";
import { cardManager } from "../../../util/cardManager";

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

    const kws = interaction.options.getString('키워드', true).split(' ');
    const view = new CardView(await cardManager.getMatch(kws));
    await interaction.editReply(view.get_updated_msg());
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name != '키워드') return;

    const suggestList = await cardManager.getSuggest(focusdVar.value);
    if (suggestList.length > 0) await interaction.respond(
      suggestList.map(card => ({ name: card.name, value: card.name }))
    );
  },
} as Command;
