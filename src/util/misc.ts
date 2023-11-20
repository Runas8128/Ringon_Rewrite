import axios from "axios";

import { MongoDB } from "./mongodb";
import { card_payload, Card } from "./schema";

export function select_weight<T>(targets: Array<T>, weights: Array<number>): T {
  const total_weight = weights.reduce((prev, curr) => prev + curr, 0);
  const weighted_random = Math.random() * total_weight;
  const last_index = targets.length - 1;
  let current_weight = 0;

  for (let i = 0; i < last_index; ++i) {
    current_weight += weights[i];
    if (weighted_random < current_weight) return targets[i];
  }

  return targets[last_index];
}

const char_map: string[] = ['추종자', '아뮬렛', '카운트다운 아뮬렛', '스펠'];

function parse_payload(payload: card_payload) {
  const { card_id, card_name, cost, char_type, atk, life, skill_disc, evo_atk, evo_life, evo_skill_disc } = payload;
  return {
    card_id, name: card_name, cost,
    type: char_map[char_type - 1],
    atk, life, desc: skill_disc,
    evo_atk, evo_life, evo_desc: evo_skill_disc,
  } as Card;
};

export async function loadCardDB() {
  const portal_url = 'https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko';
  const resp = await axios.get(portal_url);
  const payloads: card_payload[] = resp.data.data.cards;
  const cards = payloads
    .filter(card => card.card_name)
    .map(parse_payload)
    .sort((card1, card2) => card1.card_id - card2.card_id);

  await MongoDB.cards.drop();
  await MongoDB.cards.insertMany(cards);
}
