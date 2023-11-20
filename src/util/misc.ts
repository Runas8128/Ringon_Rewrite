export function select_weight<T>(targets: Array<T>, weights: Array<number>): T {
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
