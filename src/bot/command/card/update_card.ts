import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "../Command";
import { Card } from "../../../util/schema";
import axios from "axios";
import { MongoDB } from "../../../util/mongodb";

export default {
  perm: 'admin',
  data: new SlashCommandBuilder()
    .setName('포탈업뎃')
    .setDescription('카드DB를 업데이트합니다.'),
  async execute(interaction) {
    await interaction.reply('🔄 카드 DB를 업데이트하는 중입니다.');

    // TODO: extract update procedure to other function
    await MongoDB.cards.drop();
    const portal_url = 'https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko';
    const resp = await axios.get(portal_url);
    const payloads: card_payload[] = resp.data.data.cards;

    const cards = payloads
      .filter(card => card.card_name)
      .map(parse_payload)
      .sort((card1, card2) => card1.card_id - card2.card_id);
    await MongoDB.cards.insertMany(cards);

    try {
      await interaction.editReply('카드 DB 업데이트가 끝났습니다!')
    } catch (err) {
      await interaction.channel?.send('카드 DB 업데이트가 끝났습니다!');
    }
  },
} as Command;

interface card_payload {
  card_id: number;
  card_name: string;
  cost: number;
  char_type: number;
  atk: number;
  life: number;
  skill_disc: string;
  evo_atk: number;
  evo_life: number;
  evo_skill_disc: string;
}

const char_map : { [keys: number]: string } = {
  1: '추종자',
  2: '아뮬렛',
  3: '카운트다운 아뮬렛',
  4: '스펠',
};

const parse_payload = ({
  card_id, card_name, cost, char_type,
  atk, life, skill_disc,
  evo_atk, evo_life, evo_skill_disc,
}: card_payload) => ({
  card_id, name: card_name, cost,
  type: char_map[char_type],
  atk, life, desc: skill_disc,
  evo_atk, evo_life, evo_desc: evo_skill_disc,
} as Card);
