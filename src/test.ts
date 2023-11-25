import { MongoClient, ServerApiVersion } from 'mongodb';
import { join } from 'path';

interface Card {
  card_id: number;
  name: string;
  cost: number;
  type: string;
  atk: number;
  life: number;
  desc: string;
  evo_atk: number;
  evo_life: number;
  evo_desc: string;
}

async function run() {
  const b = Date.now();

  const client = new MongoClient(
    'mongodb+srv://wmtd.pqaymbl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority',
    {
      tlsCertificateKeyFile: join(__dirname, 'config/env/WMTD_DB_KEY.pem'),
      serverApi: ServerApiVersion.v1
    }
  );

  try {
    const b1 = Date.now();
    await client.connect();
    console.log(`Server connecting: ${Date.now() - b1}ms`);

    const colCard = client.db('card').collection<Card>('cards');
    
    const b2 = Date.now();
    const count = await colCard.countDocuments();
    console.log(`Document counting: ${Date.now() - b2}ms ; count: ${count}`);

    const b3 = Date.now();
    const kw = "꼭두각시 다과회"
    const _rst = await colCard
      .find({ $or: kw?.split(' ').map(k => ({ name: { $regex: k } })) })
      .map(filter(kw))
      .toArray();
    const rst = _rst
      .sort((l, r) => r.score - l.score);
    console.log(`Card Searching: ${Date.now() - b3}ms ; length: ${rst.length}; ${rst.map(c => `${c.name} (${c.score})`)}`);
  } catch(e) {
    console.dir(e);
  } finally {
    await client.close();
  }

  const e = Date.now();

  console.log(`Total Time duration: ${e - b}ms`);
}

run().catch(console.dir);

function filter(kw?: string) {
  const kws = kw?.split(' ');
  const kw_filter = kws ?
    (card: Card) => kws.filter(kw => card.name.includes(kw)).length :
    (_0: Card) => 1;

  return (c: Card) => ({
    name: c.name,
    cost: c.cost,
    type: c.type,
    atk: c.atk,
    life: c.life,
    desc: c.desc,
    evo_atk: c.evo_atk,
    evo_life: c.evo_life,
    evo_desc: c.evo_desc,
    score: kw_filter(c),
  });
}
