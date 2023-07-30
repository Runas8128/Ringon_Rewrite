import { APIEmbedField } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import StudiedView from "../../view/StudiedView";
import { DB_Manager } from "../../../database";
import { FullDetectObj } from "../../../database/detect";

const cut = (str: string, len: number) =>
  str.length > len ?
    str.substring(0, len - 3) + '...' :
    str;

// detect object to EmbedField
class d2ef {
  static get full() {
    return d2ef.fullList.map(d2ef.fullParse);
  }

  static fullParse(obj: FullDetectObj): APIEmbedField {
    return {
      name: obj.target,
      value: cut(obj.result, 50),
      inline: true,
    };
  }

  static get fullList(): FullDetectObj[] {
    return DB_Manager.detect.full;
  }

  static get prob() {
    return d2ef.probKey.map(d2ef.probParse);
  }
  
  static probParse(tar: string): APIEmbedField {
    return {
      name: tar,
      value:d2ef.probVal(tar),
      inline: false,
    };
  }
  
  static probVal(tar: string): string {
    return DB_Manager.detect.prob
      .filter(obj => obj.target === tar)
      .map(obj => `${obj.result} (가중치: ${obj.ratio})`)
      .join('\n');
  }

  static get probKey(): string[] {
    return [...new Set(DB_Manager.detect.prob.map(obj => obj.target))];
  }
}

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('배운거')
    .setDescription('링곤이의 단어장을 보여드립니다. 추가/삭제는 개발자에게 직접 요청해주세요.'),
  async execute(interaction) {
    const fields: APIEmbedField[] = d2ef.full.concat(d2ef.prob);

    const view = new StudiedView(
      fields.length > 0 ?
        fields :
        [{ name: '엥 비어있네요', value: '왜지...', inline: true }],
    );
    await interaction.reply(view.get_updated_msg());
  },
} as Command;
