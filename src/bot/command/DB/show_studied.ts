import { APIEmbedField } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import StudiedView from "../../view/StudiedView";
import { detectManager } from "../../../util/detectManager";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('배운거')
    .setDescription('링곤이의 단어장을 보여드립니다. 추가/삭제는 개발자에게 직접 요청해주세요.'),
  async execute(interaction) {
    const fields = await detectManager.getFields();
    const view = new StudiedView(fields);
    await interaction.reply(view.get_updated_msg());
  },
} as Command;
