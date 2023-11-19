import { APIEmbedField } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import StudiedView from "../../view/StudiedView";
import { MongoDB } from "../../../util/mongodb";
import { FullDetectObj } from "../../../util/schema";

// TODO: move all these functions to util
const cut = (str: string, len: number) =>
  str.length > len ?
    str.substring(0, len - 3) + '...' :
    str;

const fullParse = (obj: FullDetectObj) => ({
  name: obj.target,
  value: cut(obj.result, 50),
  inline: true,
} as APIEmbedField);

const probVal = (tar: string) =>
  MongoDB.prob.find({ target: { $eq: tar } })
    .map(obj => `${obj.result} (가중치: ${obj.ratio})`)
    .toArray()
    .then(a => a.join('\n'));

const probParse = async (tar: string) => ({
  name: tar,
  value: await probVal(tar),
  inline: false,
} as APIEmbedField);

export default {
  perm: 'member',
  data: new SlashCommandBuilder()
    .setName('배운거')
    .setDescription('링곤이의 단어장을 보여드립니다. 추가/삭제는 개발자에게 직접 요청해주세요.'),
  async execute(interaction) {
    const fields: APIEmbedField[] = (await MongoDB.full.find().map(fullParse).toArray());
    for await (const a of MongoDB.prob.find()) fields.push(await probParse(a.target));

    const view = new StudiedView(
      fields.length > 0 ?
        fields :
        [{ name: '엥 비어있네요', value: '왜지...', inline: true }],
    );
    await interaction.reply(view.get_updated_msg());
  },
} as Command;
