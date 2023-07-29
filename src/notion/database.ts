import { setTimeout } from "timers/promises";
import { UnknownHTTPResponseError } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { Notion } from "./notion";
import { PageObject, PropertyDiscriptor, PropertyPayload, getProperty, unwrap_property, wrap_property } from "./property";
import { loggerGen } from "../logger";

const logger = loggerGen.getLogger(__filename);

export class Database {
  database_id: string;

  constructor(database_id: string) {
    this.database_id = database_id;
  }

  async push(...stuffs: PropertyPayload[]) {
    try {
      const properties: { [keys: string]: any } = {};
      for (const stuff of stuffs) {
        properties[stuff.name] = wrap_property(stuff);
      }

      return Notion!.pages.create({
        parent: {
          type: 'database_id',
          database_id: this.database_id,
        },
        properties: properties,
      });
    }
    catch (err) {
      if (!(err instanceof UnknownHTTPResponseError))
        throw err;

      logger.warn(
        `Unknown HTTP response error: code ${err.code}, retrying in 100ms`,
      );
      await setTimeout(100);
      this.push(...stuffs);
    }
  }

  async update(page_id: string, ...stuffs: PropertyPayload[]) {
    const properties: { [keys: string]: any } = {};
    for (const stuff of stuffs) {
      properties[stuff.name] = wrap_property(stuff);
    }

    return Notion!.pages.update({
      page_id: page_id,
      properties: properties,
    });
  }

  async load(...properties: PropertyDiscriptor[]) {
    let pages: QueryDatabaseResponse;
    let start_cursor: string | null = null;
    const data: any[] = [];

    do {
      pages = await Notion!.databases.query({
        database_id: this.database_id,
        start_cursor: start_cursor ?? undefined,
      });
      pages.results.forEach(result => {
        const obj: { [keys: string]: any } = {};
        properties.forEach(({ name, type }) => {
          obj[name] = type === 'page_id' ? result.id : unwrap_property(getProperty(result, name));
        });
        data.push(obj);
      });
      start_cursor = pages.next_cursor;
    } while (pages.has_more);

    return data;
  }

  async delete(page_id: string) {
    try {
      await Notion!.blocks.delete({ block_id: page_id });
    }
    catch (err) {
      if (!(err instanceof UnknownHTTPResponseError)) throw err;
      logger.warn(`Unknown HTTP response error: code ${err.code}, retrying in 100ms`);
      await setTimeout(100);
      await this.delete(page_id);
    }
  }

  async drop() {
    const all_page: PageObject[] = await this.load(
      { name: 'page_id', type: 'page_id' },
    );
    for (const page of all_page) {
      await this.delete(page.page_id);
    }
  }
}