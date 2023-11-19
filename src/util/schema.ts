export interface FullDetectObj {
  target: string;
  result: string;
}

export interface ProbDetectObj {
  target: string;
  result: string;
  ratio: number;
}

export interface Deck {
  name: string;
  clazz: string;
  desc: string;
  author: string;
  image_url: string;
  timestamp: string;
  version: number;
  contributors: string[];
}

export interface Util {
  key: string;
  value: string;
}

export interface Card {
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
