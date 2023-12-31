import { ButtonInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

type IndexModifier = (index: number) => number;

export default class {
  index: number;
  length: number;

  constructor(length: number) {
    this.index = 0;
    this.length = length;
  }

  async update_message(interaction: ButtonInteraction, modify_index: IndexModifier) {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }
    this.index = modify_index(this.index);
    await interaction.message.edit(this.get_updated_msg());
  }

  check_range() {
    if (this.index < 0) this.index = 0;
    if (this.index >= this.length) this.index = this.length - 1;
  }

  build_embed() {
    return new EmbedBuilder();
  }

  build_actionrow() {
    return new ActionRowBuilder<ButtonBuilder>();
  }

  get_updated_msg() {
    this.check_range();
    return {
      embeds: [this.build_embed()],
      components: [this.build_actionrow()],
    };
  }
}
