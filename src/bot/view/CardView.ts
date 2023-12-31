import { ButtonStyle } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

import UpDownView from "./UpDownView";
import { eventHandler } from "../event/btnClick";
import { Card } from '../../database/schema';

export default class extends UpDownView {
  cards: Card[];

  prev: ButtonBuilder;
  next: ButtonBuilder;

  constructor(cards: Card[]) {
    super(cards.length);
    this.cards = cards;

    this.prev = eventHandler
      .register(i => this.update_message(i, index => index - 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('≪ 이전 카드')
      .setCustomId(`Card_prev_${Date.now()}`);

    this.next = eventHandler
      .register(i => this.update_message(i, index => index + 1))
      .setStyle(ButtonStyle.Primary)
      .setLabel('다음 카드 ≫')
      .setCustomId(`Card_next_${Date.now()}`);
  }

  build_embed() {
    const card = this.cards[this.index];

    const embed = new EmbedBuilder()
      .setTitle(`카드 이름: ${card.name}`)
      .setImage(`https://shadowverse-portal.com/image/card/phase2/common/C/C_${card.card_id}.png`);

    if (card.type === '추종자') {
      embed.addFields(
        { name: '비용', value: card.cost.toString(), inline: true },
        { name: '공격력/체력', value: `${card.atk}/${card.life}`, inline: true },
        { name: '진화 후 공격력/체력', value: `${card.evo_atk}/${card.evo_life}`, inline: true },
        { name: '진화 전 설명', value: card.desc.replace('<br>', '\n') || '...' },
        { name: '진화 후 설명', value: card.evo_desc.replace('<br>', '\n') || '...', inline: true },
      );
    }
    else {
      embed.addFields(
        { name: '비용', value: card.cost.toString() },
        { name: '설명', value: card.desc.replace('<br>', '\n') },
      );
    }
    return embed;
  }

  build_actionrow() {
    const card = this.cards[this.index];

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        this.prev,
        this.next,
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('포탈 바로가기')
          .setURL(`https://shadowverse-portal.com/card/${card.card_id}?lang=ko`),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('일러스트 보기')
          .setURL(`https://svgdb.me/assets/cardanim/${card.card_id}.mp4`),
      );
    return row;
  }

  check_range() {
    if (this.index <= 0) this.index = 0;
    this.prev.setDisabled(this.index === 0);
    if (this.index >= this.cards.length - 1) this.index = this.cards.length - 1;
    this.next.setDisabled(this.index === this.cards.length - 1);
  }
}
