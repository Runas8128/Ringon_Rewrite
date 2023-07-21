import { Events } from "discord.js";
import { Event } from "./Event";
import { isTesting } from "../../config/options/client_options";
import { loggerGen } from "../../util/logger";
import { Bot } from "../../util/bot";

const logger = loggerGen.getLogger(__filename);

export default {
  name: Events.ClientReady,
  once: true,
  async execute() {
    logger.info('Bot is ready!');

    if (isTesting) {
      Bot.client!.user?.setPresence({
        status: 'dnd',
        activities: [{ name: '버그 수정' }],
      });
    }
  },
} as Event;
