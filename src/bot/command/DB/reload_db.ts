import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { deckManager } from "../../../util/deckManager";
import { cardManager } from "../../../util/cardManager";
import { detectManager } from "../../../util/detectManager";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('업데이트')
    .setDescription('DB를 다시 로드합니다.'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔄 DB를 업데이트하는 중입니다')
          .setDescription('예상 시간: ~ 3분')
      ],
    });

    const sync_start = Date.now();
    await deckManager.load(interaction.guild!);
    await detectManager.load();
    await cardManager.updateDB();
    const sync_end = Date.now();
    
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔄 DB 업데이트 완료!')
          .setDescription(`소요 시간: ${(sync_end - sync_start) / 1000}초`),
      ],
    });
  },
} as Command;
