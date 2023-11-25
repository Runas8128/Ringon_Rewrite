import { Cards } from "./cards";
import { DeckList } from "./decklist";
import { Detect } from "./detect";

import { loggerGen } from "../logger";

const logger = loggerGen.getLogger(__filename);

type dbName = 'decklist' | 'cards';

class Manager {
  detect: Detect;
  decklist: DeckList;
  cards: Cards;
  loading: { [keys: string]: boolean };

  constructor() {
    this.detect = new Detect();
    this.decklist = new DeckList();
    this.cards = new Cards();

    this.loading = {
      detect: false,
      decklist: false,
      cards: false,
    };
  }

  async load_all() {
    await Promise.all([
      this.load('decklist'),
      this.load('cards'),
    ]);
  }

  async load(DB: dbName) {
    if (this.loading[DB]) {
      logger.warn(`${DB} database is already in loading state, skipping.`);
      return;
    }

    try {
      const sync_start = Date.now();

      logger.info(`Loading ${DB} database`);
      this.loading[DB] = true;

      await this[DB].load();

      const last_sync = Date.now();
      logger.info(`${DB} database load success. time duration: ${last_sync - sync_start}ms`);
    }
    catch (err: any) {
      logger.error(`An error occured while loading ${DB} database`);
      logger.error(err.stack);
    }
    finally {
      this.loading[DB] = false;
    }
  }
}

export const DB_Manager = new Manager();
