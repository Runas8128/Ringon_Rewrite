import { join } from 'path';
import { config } from 'dotenv';
import { MongoDB } from './util/mongodb';

async function run() {
  try {
    config({
      path: join(__dirname, 'config', 'env', 'prod.env')
    });
    await MongoDB.connect();
    const clazz = "로얄";
    const r = MongoDB.deck.aggregate([{ $match: { clazz: { $eq: clazz } } }, { $count: "count" }]);
    console.log();
  } finally {
    // Ensures that the client will close when you finish/error
    await MongoDB.disconnect();
  }
}

run().catch(console.dir);
