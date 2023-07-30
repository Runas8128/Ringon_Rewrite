import { Events } from "discord.js";

import { Event } from "./Event";
import { loggerGen } from "../../logger";

const logger = loggerGen.getLogger(__filename);

export default {
  name: Events.ClientReady,
  once: true,
  async execute() {
    logger.info('Bot is ready!');
  },
} as Event;
