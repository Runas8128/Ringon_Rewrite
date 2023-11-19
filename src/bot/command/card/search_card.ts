import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import CardView from "../../view/CardView";
import { MongoDB } from "../../../util/mongodb";
import { Card } from "../../../util/schema";

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
    let list: Card[] = await MongoDB.cards.find().toArray();
    const kw_pred = (card: Card) => kws.filter(word => card.name.includes(word)).length;

    list = list.sort((c1, c2) => kw_pred(c2) - kw_pred(c1));
    const first_not_match_idx = list.findIndex(deck => kw_pred(deck) === 0);
    list.splice(first_not_match_idx);

    await interaction.editReply(new CardView(list).get_updated_msg());
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name != '키워드') return;
    
    const result = await MongoDB.cards.find({ name: { $regex: focusdVar.value } })
      .limit(25)
      .toArray();

    if (result.length > 0) await interaction.respond(
      result.map(card => ({ name: card.name, value: card.name }))
    );
  },
} as Command;
