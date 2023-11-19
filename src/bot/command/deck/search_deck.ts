import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import DecklistView from "../../view/DecklistView";
import { MongoDB } from "../../../util/mongodb";
import { Deck } from "../../../util/schema";

export const classes : { [keys: string]: string } = {
  "엘프": "1004600679433777182",
  "로얄": "1004600684517261422",
  "위치": "1004600687688163418",
  "드래곤": "1004600677751848961",
  "네크로맨서": "1004600681266675782",
  "뱀파이어": "1004600685985271859",
  "비숍": "1004600676053155860",
  "네메시스": "1004600682902462465"
};

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('덱검색')
    .setDescription('덱을 검색해줍니다.')
    .addStringOption(option => option
      .setName('검색어')
      .setDescription('검색 대상: 이름, 해시태그')
      .setAutocomplete(true))
    .addUserOption(option => option
      .setName('제작자')
      .setDescription('검색 대상: 제작자'))
    .addStringOption(option => option
      .setName('클래스')
      .setDescription('검색 대상: 클래스')
      .addChoices(
        ...Object.keys(classes)
          .map(clazz => ({ name: clazz, value: clazz })),
      )),
  async execute(interaction) {
    const keyword = interaction.options.getString('검색어');
    const author = interaction.options.getUser('제작자');
    const clazz = interaction.options.getString('클래스');

    const kw_pred = (deck: Deck, kws: string[]) =>
      kws.filter(kw => deck.name.includes(kw) || deck.desc.includes('#' + kw)).length;

    let decks: Deck[] = (await MongoDB.deck.find({
      author: author?.id,
      clazz: clazz ?? undefined,
    }).toArray());

    if (keyword) {
      const kws = keyword.split(' ');
      decks = decks.sort((d1, d2) => kw_pred(d2, kws) - kw_pred(d1, kws));
      const first_not_match_idx = decks.findIndex(deck => kw_pred(deck, kws) === 0);
      decks.splice(first_not_match_idx);
    }

    const dlView = new DecklistView(decks, interaction.guild!);
    await interaction.reply(dlView.get_updated_msg());
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name !== '검색어') return;

    await interaction.respond(
      await MongoDB.deck
        .find({ name: { $regex: focusdVar.value } })
        .limit(25)
        .map(deck => ({ name: deck.name, value: deck.name }))
        .toArray(),
    );
  },
} as Command;
