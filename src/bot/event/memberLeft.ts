import { Events, GuildMember, PartialGuildMember, TextChannel } from "discord.js";

import { Event } from "./Event";
import { channel } from "../../config/options/discord";

export default {
  name: Events.GuildMemberRemove,
  once: false,
  async execute(member: GuildMember | PartialGuildMember) {
    const adminCh = await member.guild.channels.fetch(channel.admin) as TextChannel;
    await adminCh.send(`${member.nickname ?? member.user.username}님이 서버를 나가셨습니다 :(`);
  },
} as Event;
