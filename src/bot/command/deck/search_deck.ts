import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import DecklistView from "../../view/DecklistView";
import { DeckList } from "../../../database";
import { classes } from '../../../misc';

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
    const decks = await DeckList.search_deck({
      keyword: interaction.options.getString('검색어') ?? undefined,
      author: interaction.options.getUser('제작자')?.id,
      clazz: interaction.options.getString('클래스') ?? undefined,
    });

    const dlView = new DecklistView(decks, interaction.guild!);
    await interaction.reply(dlView.get_updated_msg());
  },
  async autocompleter(interaction) {
    const focusdVar = interaction.options.getFocused(true);
    if (focusdVar.name !== '검색어') return;

    const rst = await DeckList.search_deck({ keyword: focusdVar.value });
    await interaction.respond(
      rst.slice(0, 25)
        .map(deck => ({ name: deck.name, value: deck.name })),
    );
  },
} as Command;
