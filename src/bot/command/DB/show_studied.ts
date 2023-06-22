import { APIEmbedField, SlashCommandBuilder } from "discord.js";
import { Command } from "../Command";
import { reply } from "../../../util/misc";
import { DB_Manager } from "../../database";
import StudiedView from "../../view/StudiedView";

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('배운거')
    .setDescription('링곤이의 단어장을 보여드립니다. 추가/삭제는 개발자에게 직접 요청해주세요.'),
  async execute(interaction) {
    const fields: APIEmbedField[] = DB_Manager.detect.full
      .map(({ target, result }) => ({
        name: target,
        value: result.length > 50 ?
          result.substring(0, 47) + '...' :
          result,
        inline: true,
      }));

    const probIndex = [...new Set(
      Object.keys(DB_Manager.detect.prob)
        .map(index => DB_Manager.detect.prob[parseInt(index)].target),
    )];

    fields.push(
      ...probIndex
        .map(target => ({
          name: target,
          value: DB_Manager.detect.prob
            .filter(obj => obj.target == target)
            .map(({ result, ratio }) => `${result} (가중치: ${ratio})`)
            .join('\n'),
          inline: false,
        })),
    );
    reply(interaction, new StudiedView(
      fields.length > 0 ?
        fields :
        [{ name: '엥 비어있네요', value: '왜지...', inline: true }],
    ).get_updated_msg());
  },
} as Command;
