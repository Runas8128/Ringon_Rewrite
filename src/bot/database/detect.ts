import { detect } from '../../config/options/notion';
import { Database } from '../../util/notion';

function select_weight<T>(targets: Array<T>, weights: Array<number>): T {
  const total_weight = weights.reduce((prev, curr) => prev + curr, 0);
  const weighted_random = Math.random() * total_weight;
  const last_index = targets.length - 1;
  let current_weight = 0;

  for (let i = 0; i < last_index; ++i) {
    current_weight += weights[i];
    if (weighted_random < current_weight) {
      return targets[i];
    }
  }

  return targets[last_index];
}

interface FullDetectObj {
  target: string;
  result: string;
}

interface ProbDetectObj {
  target: string;
  result: string;
  ratio: number;
}

export class Detect {
  id_map: { [keys: string]: string };
  full_db: Database;
  prob_db: Database;
  full: FullDetectObj[];
  prob: ProbDetectObj[];

  constructor() {
    this.id_map = detect;
    this.full_db = new Database(this.id_map.full);
    this.prob_db = new Database(this.id_map.prob);

    this.full = [];
    this.prob = [];
  }

  get_result(target: string) {
    const full_detect = this.full.find(obj => obj.target === target);
    if (full_detect) {
      return full_detect.result;
    }

    const prob_detect = this.prob.filter(obj => obj.target === target);
    if (prob_detect) {
      const result_list = prob_detect.map(obj => obj.result);
      const ratio_list = prob_detect.map(obj => obj.ratio);
      return select_weight(result_list, ratio_list);
    }
  }

  async load() {
    this.full = await this.full_db.load(
      { name: 'target', type: 'title' },
      { name: 'result', type: 'rich_text' },
    );

    this.prob = await this.prob_db.load(
      { name: 'target', type: 'title' },
      { name: 'result', type: 'rich_text' },
      { name: 'ratio', type: 'number' },
    );
  }
}
