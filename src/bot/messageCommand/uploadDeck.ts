import { ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, GuildTextBasedChannel, ModalSubmitInteraction, TextInputStyle } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";

import { MessageCommand } from "./messageCommand";
import { DeckList } from "../../database";
import { classes } from '../../misc';

enum State {
  OK = 0,
  UPDATE,
  CANCEL,
}

export default {
  name: 'uploadDeck',
  async execute(interaction) {
    const iCh = interaction.channel as GuildTextBasedChannel;
    if (!Object.keys(classes).includes(iCh.name)) {
      await interaction.reply({
        content: '⚠ 덱 등록은 해당 클래스의 채널에서만 가능합니다.',
        ephemeral: true,
      });
      return;
    }

    const [code, rst] = await getDeckInfo(interaction);
    if (!rst) {
      const message = { content: '제한시간 15분을 초과했습니다. 다시 입력해주세요!', ephemeral: true };
      try { 
        await interaction.reply(message);
      } catch (e) {
        await interaction.followUp(message);
      }
      return;
    }

    const name = rst.fields.getTextInputValue('name');
    const desc = rst.fields.getTextInputValue('desc');
    const att0 = interaction.targetMessage.attachments.first();

    if (code === State.OK) {
      if (!att0) {
        await rst.editReply({
          content: '⚠ 덱의 사진을 첨부한 메시지에서 실행해주세요!',
        });
        return;
      }

      const uploaded = await DeckList.upload_deck({
        name,
        desc,
        clazz: iCh.name,
        author: interaction.user.id,
        image_url: att0.url,
      });
      await iCh.send({ embeds: [ DeckList.make_deck_embed(uploaded!) ] });
    
      await rst.editReply({
        content: '덱 등록을 성공적으로 마쳤습니다!',
        allowedMentions: { repliedUser: false },
      });
    }
    if (code === State.UPDATE) {
      const prev_deck = await DeckList.find_deck(name);
      if (!prev_deck) return;

      const history_embed = DeckList.make_deck_embed(prev_deck);
      await DeckList.history.send({ embeds: [ history_embed ] });
  
      const uploaded = await DeckList.update_deck({
        name: prev_deck.name,
        updater: interaction.user.id,
        desc: desc,
        image_url: att0?.url
      });
      await iCh.send({ embeds: [ DeckList.make_deck_embed(uploaded!) ] });

      await rst.editReply({
        content: `${name}을 성공적으로 업데이트했습니다!`,
        allowedMentions: { repliedUser: false }
      })
    }
    if (code === State.CANCEL) {
      await rst.editReply("덱 등록을 취소합니다.");
    }
  },
} as MessageCommand;

async function getDeckInfo(interaction: CommandInteraction | ButtonInteraction): Promise<[State, ModalSubmitInteraction | undefined]> {
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
            .setStyle(TextInputStyle.Short)
        ),
      new ActionRowBuilder<TextInputBuilder>()
        .addComponents(
          new TextInputBuilder()
            .setLabel("설명")
            .setRequired(false)
            .setCustomId('desc')
            .setStyle(TextInputStyle.Paragraph)
        )
    );
  await interaction.showModal(modal);

  let rst: ModalSubmitInteraction;
  try {
    rst = await interaction.awaitModalSubmit({
      time: 1000 * 60 * 15,
      filter: _i => _i.customId === `modal_${interaction.user.id}`,
    });
  } catch(e) {
    return [ State.CANCEL, undefined ];
  }
  await rst.deferReply({ ephemeral: true });

  const name = rst.fields.getTextInputValue('name');
  if (!DeckList.find_deck(name)) return [ State.OK, rst ];

  const ID = Math.random().toString(36).substring(4);
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel("� 업데이트")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`Deck_Update_${ID}`),
      new ButtonBuilder()
        .setLabel("↩️ 이름 변경")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`Deck_Rename_${ID}`),
      new ButtonBuilder()
        .setLabel("️❌ 등록 취소")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`Deck_Cancel_${ID}`),
    );

  const msg = await interaction.followUp({
    content: "중복되는 이름의 덱이 있습니다. 업데이트하시겠습니까?",
    components: [ row ],
    ephemeral: true,
  });
  const button = await msg.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: i => i.customId.endsWith(ID) && i.user.id === interaction.user.id,
  });
  await msg.delete();

  const [ _1, action, _2 ] = button.customId.split('_');
  if (action === "Update") {
    await button.deferUpdate();
    return [ State.UPDATE, rst ];
  }
  if (action === "Cancel") {
    await button.deferUpdate();
    return [ State.CANCEL, rst ];
  }

  // default action : Rename
  await rst.deleteReply();
  return getDeckInfo(button);
}
