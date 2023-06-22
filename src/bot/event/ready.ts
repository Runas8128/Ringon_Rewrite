import { loggerGen } from "../../util/logger";
import { Event } from "./Event";

const logger = loggerGen.getLogger(__filename);

export default {
  name: 'ready',
  once: true,
  async execute() {
    logger.info('Bot is ready!');
  },
} as Event;
