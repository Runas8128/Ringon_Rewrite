import { APIEmbedField, ButtonStyle } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

import UpDownView from "./UpDownView";
import { eventHandler } from "../event/btnClick";

export default class extends UpDownView {
  title: string;
  desc: string;
  fields: APIEmbedField[];

  top: ButtonBuilder;
  up: ButtonBuilder;
  down: ButtonBuilder;
  bottom: ButtonBuilder;

  constructor(fields: APIEmbedField[]) {
    super(fields.length);

    this.title = '감지 키워드 목록입니다!';
    this.desc = '이 목록에 있는 키워드가 메시지의 내용과 일치하면, 해당 메시지를 보내줍니다.';
    this.fields = fields;

    this.top = eventHandler
      .register(async i => await this.update_message(i, index => 0))
      .setLabel('≪ 맨 앞으로')
      .setCustomId(`Studied_top_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
    this.up = eventHandler
      .register(async i => await this.update_message(i, index => index - 10))
      .setLabel('< 앞으로')
      .setCustomId(`Studied_up_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
    this.down = eventHandler
      .register(async i => await this.update_message(i, index => index + 10))
      .setLabel('뒤로 >')
      .setCustomId(`Studied_down_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
    this.bottom = eventHandler
      .register(async i => await this.update_message(i, index => this.fields.length - 10))
      .setLabel('맨 뒤로 ≫')
      .setCustomId(`Studied_bottom_${Date.now()}`)
      .setStyle(ButtonStyle.Primary);
  }

  build_embed() {
    return new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(this.desc)
      .addFields(this.fields.slice(this.index, this.index + 10));
  }

  build_actionrow() {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(this.top, this.up, this.down, this.bottom);
  }

  check_range() {
    if (this.index <= 0) this.index = 0;
    this.top.setDisabled(this.index === 0);
    this.up.setDisabled(this.index === 0);

    if (this.index >= this.fields.length - 10) this.index = this.fields.length - 10;
    this.down.setDisabled(this.index === this.fields.length - 10);
    this.bottom.setDisabled(this.index === this.fields.length - 10);
  }
}
