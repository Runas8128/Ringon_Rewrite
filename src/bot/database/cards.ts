import axios from 'axios';

export interface Card {
  page_id: string | undefined;
  card_id: number;
  name: string;
  cost: number;
  type: string;
  atk: number;
  life: number;
  desc: string;
  evo_atk: number;
  evo_life: number;
  evo_desc: string;
}

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
  cards: Card[];

  constructor() {
    this.cards = [];
  }

  parse_payload({
    card_id, card_name, cost, char_type,
    atk, life, skill_disc,
    evo_atk, evo_life, evo_skill_disc,
  }: card_payload): Card {
    return {
      page_id: undefined,
      card_id,
      name: card_name,
      cost,
      type: char_map[char_type],
      atk,
      life,
      desc: skill_disc,
      evo_atk,
      evo_life,
      evo_desc: evo_skill_disc,
    };
  }

  async load() {
    const resp = await axios.get('https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko');
    const payloads: card_payload[] = resp.data.data.cards;

    this.cards = payloads
      .filter(card => card.card_name)
      .map(this.parse_payload)
      .sort((card1, card2) => card1.card_id - card2.card_id);
  }
}
