import { EmbedBuilder, Guild, TextChannel, Client } from 'discord.js';

import { channel } from '../config/options/discord';
import { Deck } from './schema';
import { MongoDB } from './mongodb';

export const classes : { [keys: string]: string } = {
  "엘프": "1004600679433777182",
  "로얄": "1004600684517261422",
  "위치": "1004600687688163418",
  "드래곤": "1004600677751848961",
  "네크로맨서": "1004600681266675782",
  "뱀파이어": "1004600685985271859",
  "비숍": "1004600676053155860",
  "네메시스": "1004600682902462465"
};

interface DeckPayload {
  name: string;
  clazz: string;
  desc?: string;
  author: string;
  image_url: string;
}

interface DeckUpdatePayload {
  name: string;
  updater: string;
  desc?: string;
  image_url?: string;
}

export class deckManager {
  static history?: TextChannel;

  static async load(guild: Guild) {
    if (!deckManager.history) deckManager.history = guild.channels.cache
      .find(ch => ch.id === channel.history) as TextChannel;
  }

  static async analyze(client: Client) {
    const total_count = await MongoDB.deck.countDocuments();
    const embed = new EmbedBuilder()
      .setTitle(`총 ${total_count}개 덱 분석 결과`);

    for (const clazz of Object.keys(classes)) {
      const count = (await MongoDB.deck.find({ clazz: { $eq: clazz } }).toArray()).length;
      if (count === 0) continue;

      const class_emoji = client.emojis.cache.find(emoji => emoji.id === classes[clazz]);
      embed.addFields({
        name: `${class_emoji} ${clazz}`,
        value: `${count}개 (점유율: ${(count / total_count * 100).toPrecision(4)}%)`,
        inline: true,
      });
    }

    return embed;
  }

  static async update_pack(new_pack: string, guild: Guild) {
    for await (const deck of MongoDB.deck.find())
      await deckManager.history!.send({ embeds: [deckManager.make_deck_embed(deck, guild)] });
    await MongoDB.deck.drop();
    await MongoDB.util.updateOne(
      { key: 'pack_name' },
      { $set: { value: new_pack } }
    );
  }

  static async update_deck({ name, updater, desc, image_url }: DeckUpdatePayload) {
    if (!desc && !image_url) return;

    await MongoDB.deck.findOneAndUpdate(
      { name: { $eq: name } },
      {
        $set: { desc, image_url, },
        $inc: { version: 1, },
        $addToSet: { contributors: updater }
      }
    );
  }

  static make_deck_embed(deck: Deck, guild: Guild) {
    const deck_info = new EmbedBuilder()
      .setTitle(deck.name)
      .addFields(
        { name: '클래스', value: deck.clazz },
        { name: '등록일', value: deck.timestamp },
      );

    const member_cache = guild.members.cache;
    const author = member_cache.find(member => member.id === deck.author);
    deck_info.setAuthor(
      author ? {
        name: author.displayName,
        iconURL: author.displayAvatarURL(),
      } : {
        name: '정보 없음',
    });

    if (deck.version > 1) {
      deck_info.addFields({ name: '업데이트 횟수', value: deck.version.toString() });
      if (deck.contributors.length > 0) {
        deck_info.addFields({
          name: '기여자 목록',
          value: deck.contributors.map(cid => member_cache.find(m => m.id === cid)?.toString() ?? '(정보 없음)').join(', '),
        });
      }
    }

    if (deck.desc.length > 0) {
      deck_info.addFields({ name: '덱 설명', value: deck.desc, inline: false });

      const hashtags = deck.desc.match(/#(\w+)/g);
      if (hashtags) deck_info.addFields({ name: '해시태그', value: hashtags.join(', ') });
    }

    deck_info.setImage(deck.image_url);
    return deck_info;
  }

  static async upload(deckPayload: DeckPayload) {
    const deck = deckPayload as Deck;
    deck.version = 1;
    deck.timestamp = new Date()
      .toISOString()
      .split('T')[0]
      .replaceAll('-', '/');

    MongoDB.deck.insertOne(deck);
  }
}
