import { ButtonInteraction, ButtonStyle, ComponentType, Guild, TextChannel } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "@discordjs/builders";

import UpDownView from "./UpDownView";
import { eventHandler } from "../event/btnClick";
import { Deck } from "../../util/schema";
import { channel } from "../../config/options/discord";
import { MongoDB } from "../../util/mongodb";
import { classes, deckManager } from "../../util/deckManager";

export default class extends UpDownView {
  decks: Deck[];
  guild: Guild;

  prev: ButtonBuilder;
  menu: ButtonBuilder;
  next: ButtonBuilder;
  delete: ButtonBuilder;

  constructor(decks: Deck[], guild: Guild) {
    super(decks.length);
    this.decks = decks;
    this.guild = guild;

    this.prev = eventHandler
      .register(i => this.update_message(i, index => index - 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('≪ 이전 덱')
      .setCustomId(`Deck_prev_${Date.now()}`);

    this.menu = eventHandler
      .register(i => this.open_menu(i))
      .setStyle(ButtonStyle.Secondary)
      .setLabel('메뉴')
      .setCustomId(`Deck_menu_${Date.now()}`)
      .setDisabled(this.decks.length === 0);

    this.next = eventHandler
      .register(i => this.update_message(i, index => index + 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('다음 덱 ≫')
      .setCustomId(`Deck_next_${Date.now()}`);

    this.delete = eventHandler
      .register(i => this._delete(i))
      .setStyle(ButtonStyle.Danger)
      .setLabel('삭제')
      .setCustomId(`Deck_delete_${Date.now()}`);
  }

  async open_menu(interaction: ButtonInteraction) {
    await interaction.deferUpdate();

    const customID = `DeckSelector_${Date.now()}`;
    const options = this.decks.map(({ name, desc, clazz }, index) => {
      const shrunk_desc = desc.length > 100 ? desc.substring(0, 97) + '...' : desc;

      return {
        label: name,
        description: shrunk_desc || '...',
        emoji: { id: classes[clazz] },
        value: index.toString(),
      };
    });

    const select = new StringSelectMenuBuilder()
      .setCustomId(customID)
      .setPlaceholder('')
      .addOptions(options);

    await interaction.message.edit({
      embeds: [],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
      ],
    });

    const menu = await interaction.channel?.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 10 * 1000,
      filter: menubar => menubar.customId === customID,
    });

    await menu?.deferUpdate();
    await this.update_message(interaction, index => Number(menu?.values[0]));
  }

  async _delete(interaction: ButtonInteraction) {
    await interaction.deferUpdate();

    const history = interaction.guild!.channels.cache
      .find(ch => ch.id === channel.history) as TextChannel;
    await history.send({ embeds: [deckManager.make_deck_embed(this.decks[this.index], interaction.guild!)] });
    await MongoDB.deck.deleteOne({ name: { $eq: this.decks[this.index].name } });
    this.decks.splice(this.index, 1);
    await this.update_message(interaction, index => index + 1);
  }

  build_embed() {
    if (this.decks.length === 0)
      return new EmbedBuilder()
        .setTitle('❌ 검색 결과가 없습니다.');
    return deckManager.make_deck_embed(this.decks[this.index], this.guild);
  }

  build_actionrow() {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(this.prev, this.menu, this.next, this.delete);
  }

  check_range() {
    if (this.decks.length === 0) {
      this.prev.setDisabled(true);
      this.menu.setDisabled(true);
      this.next.setDisabled(true);
      this.delete.setDisabled(true);
    }
    else {
      if (this.index <= 0) this.index = 0;
      this.prev.setDisabled(this.index === 0);
      if (this.index >= this.decks.length - 1) this.index = this.decks.length - 1;
      this.next.setDisabled(this.index === this.decks.length - 1);
    }
  }
}
