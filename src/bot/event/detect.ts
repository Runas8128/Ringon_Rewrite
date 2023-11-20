import { Events, Message } from "discord.js";

import { Event } from "./Event";
import { MongoDB } from "../../util/mongodb";
import { select_weight } from "../../util/misc";

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
