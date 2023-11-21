import axios from "axios";

import { MongoDB } from "./mongodb";
import { card_payload, Card } from "./schema";

export class cardManager {
  static char_map: string[] = ['추종자', '아뮬렛', '카운트다운 아뮬렛', '스펠'];
  static loaded: boolean = false;
  static cards: Card[];

  static async load() {
    if (this.loaded) return;
    this.cards = await MongoDB.cards.find().toArray();
  }

  static async updateDB() {
    const portal_url = 'https://shadowverse-portal.com/api/v1/cards?format=json&lang=ko';
    const resp = await axios.get(portal_url);
    const payloads: card_payload[] = resp.data.data.cards;
    const cards = payloads
      .filter(card => card.card_name)
      .map(this.parse_payload)
      .sort((card1, card2) => card1.card_id - card2.card_id);
  
    await MongoDB.cards.drop();
    await MongoDB.cards.insertMany(cards);
    this.loaded = false;
    await this.load();
  }

  static async getCount() {
    await this.load();
    return this.cards.length;
  }

  static async getMatch(kws: string[]) {
    await this.load();
    const kw_pred = (card: Card) => kws.filter(word => card.name.includes(word)).length;
    const list = this.cards.sort((c1, c2) => kw_pred(c2) - kw_pred(c1));
    list.splice(list.findIndex(deck => kw_pred(deck) === 0));
    return list;
  }

  static async getSuggest(str: string) {
    await this.load();
    return this.cards.filter(c => c.name.includes(str)).slice(0, 25);
  }
  
  static parse_payload(payload: card_payload) {
    const { card_id, card_name, cost, char_type, atk, life, skill_disc, evo_atk, evo_life, evo_skill_disc } = payload;
    return {
      card_id, name: card_name, cost,
      type: this.char_map[char_type - 1],
      atk, life, desc: skill_disc,
      evo_atk, evo_life, evo_desc: evo_skill_disc,
    } as Card;
  };
}

