import { Events, GuildEmoji, Message, MessageReaction, ReactionEmoji, TextChannel, User } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { Event } from "./Event";
import { DB_Manager } from "../database";
import { classes } from "../database/decklist";
import { timer } from "../../util/misc";

class DeckUploader {
  origin: Message;
  channel: TextChannel;

  constructor(origin: Message) {
    this.origin = origin;
    this.channel = origin.channel as TextChannel;
  }

  async get_input() {
    const name = await this.collect({
      prompt: ':ledger: 덱의 이름을 입력해주세요!',
      subprompt: '시간 제한: 1분',
      timeout: 60 * 1000,
    });

    if (!name) {
      await this.channel.send('시간 초과, 덱 등록을 취소합니다.');
      return;
    }

    const desc = await this.collect({
      prompt: ':ledger: 덱의 설명을 입력해주세요!',
      subprompt: '시간 제한 X\n덱 설명을 생략하려면 생략을 입력해주세요.',
    });

    await this.upload(name, desc, 0);
  }

  async upload(name: string, desc: string | undefined, try_count: number) {
    if (DB_Manager.loading.decklist) {
      if (try_count == 0)
        await this.channel.send('DB를 로드하는 중입니다. 잠시만 기다려주세요...');

      await timer(100);
      await this.upload(name, desc, try_count + 1);
    }
    else {
      await DB_Manager.decklist.upload({
        name: name,
        clazz: this.channel.name,
        desc: desc,
        author: this.origin.author.id,
        image_url: this.origin.attachments.first()!.url,
      });

      await this.origin.reply({
        content: '덱 등록을 성공적으로 마쳤습니다!',
        allowedMentions: { repliedUser: false },
      });
    }
  }

  async collect({ prompt, subprompt, timeout }: { prompt: string, subprompt?: string, timeout?: number }) {
    const embed = new EmbedBuilder().setTitle(prompt);
    if (subprompt) embed.setDescription(subprompt);

    await this.origin.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    const result = await this.channel.awaitMessages({
      filter: msg => msg.author.id == this.origin.author.id,
      max: 1,
      time: timeout,
    });

    return result.first()?.content;
  }
}

function assert(channel: any, author: User, emoji: GuildEmoji | ReactionEmoji, user: User): channel is TextChannel {
  return channel instanceof TextChannel &&
    Object.keys(classes).includes(channel.name) &&
    emoji.id === classes[channel.name] &&
    user.id == author.id;
}

export default {
  name: Events.MessageReactionAdd,
  once: false,
  async execute({ message, emoji }: MessageReaction, user: User) {
    if (message.partial) message = await message.fetch();
    const { channel, author } = message;

    if (assert(channel, author, emoji, user))
      new DeckUploader(message).get_input();
  },
} as Event;
