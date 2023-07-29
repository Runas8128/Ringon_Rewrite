import { SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { DB_Manager } from "../../../database";
import { Deck, classes } from "../../../database/decklist";
import DecklistView from "../../view/DecklistView";

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

    let decks: Deck[] = JSON.parse(JSON.stringify(DB_Manager.decklist.decklist)); // Copy full decklist

    if (keyword) {
      const kws = keyword.split(' ');
      decks = decks.sort((d1, d2) => kw_pred(d2, kws) - kw_pred(d1, kws));
      const first_not_match_idx = decks.findIndex(deck => kw_pred(deck, kws) === 0);
      decks.splice(first_not_match_idx);
    }

    if (author) decks = decks.filter(deck => deck.author === author.id);
    if (clazz) decks = decks.filter(deck => deck.clazz === clazz);

    const dlView = new DecklistView(decks, interaction.guild!);
    await interaction.reply(dlView.get_updated_msg());
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name !== '검색어') return;

    await interaction.respond(
      DB_Manager.decklist.decklist
        .filter(deck => deck.name.includes(focusdVar.value))
        .slice(0, 25)
        .map(deck => ({ name: deck.name, value: deck.name })),
    );
  },
} as Command;
