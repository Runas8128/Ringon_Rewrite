import { Events } from "discord.js";

import { Event } from "./Event";
import { loggerGen } from "../../logger";
import { MongoDB } from "../../util/mongodb";

const logger = loggerGen.getLogger(__filename);

export default {
  name: Events.ClientReady,
  once: true,
  async execute() {
    await MongoDB.connect();
    logger.info('Bot is ready!');
  },
} as Event;
