import full from '../config/detect/full.json';
import prob from '../config/detect/prob.json';

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

export interface FullDetectObj {
  target: string;
  result: string;
}

export interface ProbDetectObj {
  target: string;
  result: string;
  ratio: number;
}

export class Detect {
  full: FullDetectObj[];
  prob: ProbDetectObj[];

  constructor() {
    this.full = full;
    this.prob = prob;
  }

  get_length() {
    return this.full.length + new Set(this.prob.map(obj => obj.target)).size;
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
}
