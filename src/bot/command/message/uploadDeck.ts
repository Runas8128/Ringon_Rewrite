import { GuildTextBasedChannel, TextInputStyle } from "discord.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";

import { MessageCommand } from "./messageCommand";
import { DB_Manager } from "../../database";
import { classes } from "../../database/decklist";
import { timer } from "../../../util/misc";

export default {
  name: 'uploadDeck',
  async execute(interaction) {
    const iCh = interaction.channel as GuildTextBasedChannel;
    if (!Object.keys(classes).includes(iCh.name)) {
      await interaction.reply('⚠ ');
      return;
    }

    const att0 = interaction.targetMessage.attachments.first();
    if (!att0) {
      await interaction.reply('⚠ ');
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(`modal_${interaction.user.id}`)
      .setTitle('덱 추가')
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>()
          .addComponents(
            new TextInputBuilder()
              .setLabel("이름")
              .setRequired(true)
              .setCustomId('name')
              .setStyle(TextInputStyle.Short),
          ),
        new ActionRowBuilder<TextInputBuilder>()
          .addComponents(
            new TextInputBuilder()
              .setLabel("설명")
              .setRequired(false)
              .setCustomId('desc')
              .setStyle(TextInputStyle.Paragraph),
          ),
      );
    await interaction.showModal(modal);
    const rst = await interaction.awaitModalSubmit({
      time: 60_000,
      filter: _i => _i.customId === `modal_${interaction.user.id}`,
    });
    
    while (DB_Manager.loading.decklist) await timer(100);
    DB_Manager.decklist.upload({
      name: rst.fields.getTextInputValue('name'),
      desc: rst.fields.getTextInputValue('desc'),
      clazz: iCh.name,
      author: interaction.user.id,
      image_url: att0.url,
    });

    await interaction.followUp({
      content: '덱 등록을 성공적으로 마쳤습니다!',
      allowedMentions: { repliedUser: false },
    });
  },
} as MessageCommand;
