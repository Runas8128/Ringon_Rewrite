import { Events, GuildMember, PartialGuildMember, TextChannel } from "discord.js";
import { Event } from "./Event";
import { channel } from "../../config/options/discord";
import { loggerGen } from "../../util/logger";

const logger = loggerGen.getLogger(__filename);

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember | PartialGuildMember) {
    logger.info(`${member.nickname ?? member.user.username} left`);
    const adminCh = await member.guild.channels.fetch(channel.admin) as TextChannel;
    logger.info(`adminCh: ${adminCh.name}`);
    await adminCh.send(`${member.nickname ?? member.user.username}님이 서버를 나가셨습니다 :(`);
  },
} as Event;
