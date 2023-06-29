import { Message } from "discord.js";
import { DB_Manager } from "../database";
import { Event } from "./Event";

export default {
  name: 'messageCreate',
  once: false,
  async execute({ author, content, channel }: Message) {
    if (author.bot) return;

    const detect_result = DB_Manager.detect.get_result(content);
    if (detect_result) await channel.send(detect_result);
  },
} as Event;
