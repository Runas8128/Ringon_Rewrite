import { Events, Message, TextChannel } from "discord.js";
import { Event } from "./Event";
import { classes } from "../database/decklist";

function assertCh(channel: any): channel is TextChannel {
  return channel instanceof TextChannel &&
    channel.parent?.name === 'Lab' &&
    Object.keys(classes).includes(channel.name);
}

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message) {
    const { author, attachments, channel } = message;
    if (!author.bot && attachments.size > 0 && assertCh(channel))
      await message.react(classes[channel.name]);
  },
} as Event;
