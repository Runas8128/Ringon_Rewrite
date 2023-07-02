import { EmbedBuilder, Guild, TextChannel, Client } from 'discord.js';
import { deck } from '../../config/options/notion';
import { channel } from '../../config/options/discord';
import { Database, Block, PropertyPayload } from '../../util/notion';
import { timer } from '../../util/misc';

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

export interface DeckPayload {
  name: string;
  clazz: string;
  desc?: string;
  author: string;
  image_url: string;
}

export interface Deck {
  page_id: string;
  deck_id: number;
  name: string;
  clazz: string;
  desc: string;
  author: string;
  image_url: string;
  timestamp: string;
  version: number;
}

export interface Contrib {
  DeckID: number;
  ContribID: string;
}

export class DeckList {
  id_map: { [keys: string]: string };

  list_db: Database;
  contrib_db: Database;
  pack_block: Block;

  decklist: Deck[];
  contrib: Contrib[];

  history: TextChannel | undefined;

  constructor() {
    this.id_map = deck;

    this.list_db = new Database(this.id_map.list);
    this.contrib_db = new Database(this.id_map.contrib);
    this.pack_block = new Block(this.id_map.pack);

    this.decklist = [];
    this.contrib = [];

    this.history = undefined;
  }

  analyze(client: Client) {
    const total_count = this.decklist.length;
    const embed = new EmbedBuilder()
      .setTitle(`총 ${total_count}개 덱 분석 결과`);

    Object.keys(classes).forEach(clazz => {
      const count = this.decklist.filter(deck => deck.clazz === clazz).length;
      if (count === 0) return;

      const class_emoji = client.emojis.cache.find(emoji => emoji.id === classes[clazz]);
      embed.addFields({
        name: `${class_emoji} ${clazz}`,
        value: `${count}개 (점유율: ${(count / total_count * 100).toPrecision(4)}%)`,
        inline: true,
      });
    });

    return embed;
  }

  async update_pack(new_pack: string, guild: Guild) {
    for (const deck of this.decklist) {
      await this._delete_deck(deck, guild);
      await timer(100);
    }
    await this.pack_block.update(new_pack);
  }

  async _delete_deck(deck: Deck, guild: Guild) {
    if (!this.history) {
      this.history = guild.channels.cache
        .find(ch => ch.id === channel.history) as TextChannel;
    }
    await this.history?.send({ embeds: [this.make_deck_embed(deck, guild)] });
    await this.list_db.delete(deck.page_id);
  }

  async update_deck(
    guild: Guild,
    id: number, updater: string,
    desc: string | undefined = undefined, image_url: string | undefined = undefined
  ) {
    if (!desc && !image_url) return;

    const deck = this.decklist.find(_deck => _deck.deck_id === id);
    if (!deck) return;

    const history_embed = this.make_deck_embed(deck, guild);

    if (desc) deck.desc = desc;
    if (image_url) deck.image_url = image_url;
    deck.version += 1;

    if (
      updater != deck.author &&
      !(this.contrib.some(obj => obj.DeckID === deck.deck_id && obj.ContribID === updater))
    ) {
      this.contrib.push({ DeckID: deck.deck_id, ContribID: updater });
      await this.contrib_db.push(
        { name: 'DeckID', value: deck.deck_id, type: 'title' },
        { name: 'ContribID', value: updater, type: 'rich_text' },
      );
    }

    await this.list_db.update(
      deck.page_id,
      ...propertify(deck),
    );

    await this.history!.send({ embeds: [history_embed] });
  }

  make_deck_embed(deck: Deck, guild: Guild) {
    const deck_info = new EmbedBuilder()
      .setTitle(deck.name)
      .addFields(
        { name: '클래스', value: deck.clazz },
        { name: '등록일', value: deck.timestamp },
      );

    const member_cache = guild.members.cache;
    const author = member_cache.find(member => member.id === deck.author);
    if (author) {
      deck_info.setAuthor({
        name: author.displayName,
        iconURL: author.displayAvatarURL(),
      });
    }
    else {
      deck_info.setAuthor({
        name: '정보 없음',
      });
    }

    if (deck.version > 1) {
      deck_info.addFields({ name: '업데이트 횟수', value: deck.version.toString() });
      const contribs = this.contrib.filter(obj => obj.DeckID === deck.deck_id);
      if (contribs.length > 0) {
        deck_info.addFields({
          name: '기여자 목록',
          value: contribs.map(obj => member_cache.find(m => m.id === obj.ContribID) ?? '(정보 없음)').join(', '),
        });
      }
    }

    if (deck.desc.length > 0) {
      deck_info.addFields({ name: '덱 설명', value: deck.desc, inline: false });
      const hashtags = deck.desc.match(/#(\w+)/g);
      if (hashtags)
        deck_info.addFields({ name: '해시태그', value: hashtags.join(', ') });
    }

    deck_info.setImage(deck.image_url);
    deck_info.setFooter({ text: `ID: ${deck.deck_id}` });
    return deck_info;
  }

  async load() {
    this.decklist = (await this.list_db.load(
      { name: 'page_id', type: 'page_id' },
      { name: 'deck_id', type: 'number' },
      { name: 'name', type: 'title' },
      { name: 'clazz', type: 'select' },
      { name: 'desc', type: 'rich_text' },
      { name: 'author', type: 'rich_text' },
      { name: 'image_url', type: 'rich_text' },
      { name: 'timestamp', type: 'rich_text' },
      { name: 'version', type: 'number' },
    )).sort((a, b) => a.deck_id - b.deck_id);

    this.contrib = await this.contrib_db.load(
      { name: 'DeckID', type: 'number' },
      { name: 'ContribID', type: 'rich_text' },
    );
  }

  async upload(deckPayload: DeckPayload) {
    const deck = deckPayload as Deck;
    deck.version = 1;
    deck.deck_id = (this.decklist.at(-1)?.deck_id ?? 0) + 1;
    deck.timestamp = new Date()
      .toISOString()
      .split('T')[0]
      .replaceAll('-', '/');

    const resp = await this.list_db.push(...propertify(deck));
    deck.page_id = resp?.id || '';
    this.decklist.push(deck);
  }
}

const propertify = (deck: Deck): PropertyPayload[] => [
  { name: 'deck_id', type: 'number', value: deck.deck_id },
  { name: 'name', type: 'title', value: deck.name },
  { name: 'clazz', type: 'select', value: deck.clazz },
  { name: 'desc', type: 'rich_text', value: deck.desc },
  { name: 'author', type: 'rich_text', value: deck.author },
  { name: 'image_url', type: 'rich_text', value: deck.image_url },
  { name: 'timestamp', type: 'rich_text', value: deck.timestamp },
  { name: 'version', type: 'number', value: deck.version },
];
