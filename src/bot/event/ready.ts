import { Events } from "discord.js";

import { Event } from "./Event";
import { Logger } from "../../logger";

const logger = Logger.getLogger(__filename);

export default {
  name: Events.ClientReady,
  once: true,
  async execute() {
    logger.info('Bot is ready!');
  },
} as Event;
