import { join } from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { FullDetectObj, ProbDetectObj, Deck, Util, Card } from './schema';

const url = 'mongodb+srv://wmtd.pqaymbl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority';

export class MongoDB {
  private static __client = new MongoClient(url, {
    tlsCertificateKeyFile: join(__dirname, '..', 'config/env/WMTD_DB_KEY.pem'),
    serverApi: ServerApiVersion.v1
  });
  private static __connected = false;
  private static __util_data: { [ key: string ]: string };

  static async connect() {
    if (!this.__connected) {
      await this.__client.connect();
      this.__connected = true;
      this.__util_data = Object.fromEntries(
        (await this.db.util.collection<Util>('util').find({}).toArray())
          .map(v => [v.key, v.value]));
    }
  }

  static async disconnect() {
    if (this.__connected) {
      await this.__client.close();
      this.__connected = false;
    }
  }

  static get db() {
    return {
      card: this.__client.db('card'),
      deck: this.__client.db('deck'),
      detect: this.__client.db('detect'),
      util: this.__client.db('util'),
    };
  }

  static get full() {
    return this.db.detect.collection<FullDetectObj>('full');
  }

  static get prob() {
    return this.db.detect.collection<ProbDetectObj>('prob');
  }

  static get deck() {
    return this.db.deck.collection<Deck>(this.__util_data.pack_name);
  }

  static get cards() {
    return this.db.card.collection<Card>('cards');
  }

  static get util() {
    return this.db.util.collection<Util>('util');
  }
};
