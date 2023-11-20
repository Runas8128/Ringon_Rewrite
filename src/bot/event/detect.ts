import { Events, Message } from "discord.js";

import { Event } from "./Event";
import { detectManager } from "../../util/detectManager";

export default {
  name: Events.MessageCreate,
  once: false,
  async execute({ author, content, channel }: Message) {
    if (author.bot) return;

    const rst = await detectManager.detect(content);
    if (rst) await channel.send(rst);
  },
} as Event;
