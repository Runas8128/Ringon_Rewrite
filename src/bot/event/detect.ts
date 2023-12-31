import { Events, Message } from "discord.js";

import { Event } from "./Event";
import { Detect } from "../../database";

export default {
  name: Events.MessageCreate,
  once: false,
  async execute({ author, content, channel }: Message) {
    if (author.bot) return;

    const detect_result = Detect.get_result(content);
    if (detect_result) await channel.send(detect_result);
  },
} as Event;
