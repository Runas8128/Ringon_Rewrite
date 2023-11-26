import { join } from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Deck, Card } from './schema';

export class MongoDB {
  private static __client = new MongoClient(process.env.mongodb!, {
    tlsCertificateKeyFile: join(__dirname, '..', 'config/env/WMTD_DB_KEY.pem'),
    serverApi: ServerApiVersion.v1
  });
  private static __connected = false;
  private static __pack_name = '';

  static async connect() {
    if (this.__connected) return;

    await this.__client.connect();
    this.__connected = true;
    this.__pack_name = (await this.colPack.find({}).toArray())[0].pack_name;
  }

  static async disconnect() {
    if (!this.__connected) return;

    await this.__client.close();
    this.__connected = false;
  }

  static get db() {
    return {
      card: this.__client.db('card'),
      deck: this.__client.db('deck'),
    };
  }

  static get colDeck() {
    return this.db.deck.collection<Deck>(this.__pack_name);
  }

  static get colPack() {
    return this.db.deck.collection<{ pack_name: string }>('util');
  }

  static get colCard() {
    return this.db.card.collection<Card>('cards');
  }

  static get pack() {
    return this.__pack_name;
  }
};
