import { Events, Message } from "discord.js";

import { Event } from "./Event";
import { MongoDB } from "../../util/mongodb";

export default {
  name: Events.MessageCreate,
  once: false,
  async execute({ author, content, channel }: Message) {
    if (author.bot) return;

    const a = await MongoDB.full.findOne({ target: { $eq: content } });
    if (a) return await channel.send(a.result);

    const b = await MongoDB.prob.find({ target: { $eq: content } }).toArray();
    if (b) return await channel.send(select_weight(b.map(r => r.result), b.map(r => r.ratio)));
  },
} as Event;

// TODO: move this to util.ts
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
