import axios from 'axios';
import { MongoDB } from './mongoDB';
import { Card } from './schema';

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

export class Cards {
  static async get_count() {
    return await MongoDB.colCard.countDocuments();
  }

  static async search_card(keyword: string) {
    const _rst = await MongoDB.colCard
      .find({ $or: keyword.split(' ').map(k => ({ name: { $regex: k } })) })
      .map(giveScore(keyword))
      .toArray();
    return _rst.sort((l, r) => r.score - l.score);
  }

  static async update() {
    const resp = await axios.get('https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko');
    const payloads: card_payload[] = resp.data.data.cards;

    const cards = payloads
      .filter(card => card.card_name)
      .map(parse_payload)
      .sort((card1, card2) => card1.card_id - card2.card_id);
    
    await MongoDB.colCard.drop();
    await MongoDB.colCard.insertMany(cards);
  }
}

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

function giveScore(kw?: string) {
  const kws = kw?.split(' ');
  const kw_filter = kws ?
    (card: Card) => kws.filter(kw => card.name.includes(kw)).length :
    (_0: Card) => 1;

  return (c: Card) => Object.assign(c, { score: kw_filter(c) });
}
