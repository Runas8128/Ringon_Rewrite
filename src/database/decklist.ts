import { EmbedBuilder, Guild, TextChannel, Client } from 'discord.js';

import { channel } from '../config/options/discord';
import { Deck } from './schema';
import { MongoDB } from './mongoDB';
import { classes } from '../misc';

export class DeckList {
  private static __guild?: Guild;

  static setGuild(guild: Guild) {
    if (!this.__guild) this.__guild = guild;
  }

  static get history() {
    return this.__guild?.channels.cache.find(ch => ch.id === channel.history) as TextChannel;
  }

  static async analyze(client: Client) {
    const total_count = await MongoDB.colDeck.countDocuments();
    const embed = new EmbedBuilder()
      .setTitle(`총 ${total_count}개 덱 분석 결과`);

    for (const clazz of Object.keys(classes)) {
      const count = (await MongoDB.colDeck.find({ clazz: { $eq: clazz } }).toArray()).length;
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

  static async delete_deck(name: string) {
    const deck = await MongoDB.colDeck.findOne({ name });
    if (!deck) return;

    await this.history.send({ embeds: [this.make_deck_embed(deck)] });
    await MongoDB.colDeck.deleteOne({ name });
  }

  // find one deck with exact name
  static async find_deck(name: string) {
    return await MongoDB.colDeck.findOne({ name });
  }

  // search some decks with keyword, author and class info
  static async search_deck({ keyword, author, clazz }: SearchPayload) {
    const _rst = await MongoDB.colDeck
      .find({
        author, clazz,
        $or: keyword?.split(' ').map(k => ({ name: { $regex: k } }))
      })
      .map(giveScore(keyword))
      .toArray();

    return _rst.sort((l, r) => r.score - l.score);
  }

  static async upload_deck(deckPayload: DeckPayload) {
    const deck = deckPayload as Deck;
    deck.version = 1;
    deck.timestamp = new Date()
      .toISOString()
      .split('T')[0]
      .replaceAll('-', '/');

    await MongoDB.colDeck.insertOne(deck);
    return deck;
  }

  static async update_deck({ name, updater, desc, image_url }: DeckUpdatePayload) {
    if (!desc && !image_url) return null;

    await MongoDB.colDeck.findOneAndUpdate(
      { name: { $eq: name } },
      {
        $set: { desc, image_url, },
        $inc: { version: 1, },
        $addToSet: { contributors: updater }
      }
    );
    return this.find_deck(name);
  }

  static async update_pack(new_pack: string) {
    for await (const deck of MongoDB.colDeck.find())
      await this.history.send({ embeds: [this.make_deck_embed(deck)] });

    await MongoDB.colPack.updateOne(
      { key: 'pack_name' },
      { $set: { value: new_pack } }
    );
  }

  static make_deck_embed(deck: Deck) {
    const deck_info = new EmbedBuilder()
      .setTitle(deck.name)
      .addFields(
        { name: '클래스', value: deck.clazz },
        { name: '등록일', value: deck.timestamp },
      );

    const member_cache = this.__guild!.members.cache;
    const author = member_cache.find(member => member.id === deck.author);
    deck_info.setAuthor(
      author ? {
        name: author.displayName,
        iconURL: author.displayAvatarURL(),
      } : {
        name: '정보 없음',
      }
    );

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
}

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

interface SearchPayload {
  keyword?: string;
  author?: string;
  clazz?: string;
}

function giveScore(kw?: string) {
  const kws = kw?.split(' ');
  const kw_filter = kws ?
    (deck: Deck) => kws.filter(kw => deck.name.includes(kw) || deck.desc.includes('#' + kw)).length :
    (_: Deck) => 1;

  return (d: Deck) => Object.assign(d, { score: kw_filter(d) });
}
