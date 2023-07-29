import { Client, UnknownHTTPResponseError } from '@notionhq/client';
import { PageObjectResponse, PartialPageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { loggerGen } from '../logger';
import { setTimeout } from 'timers/promises';

const logger = loggerGen.getLogger(__filename);

let Notion: Client | undefined = undefined;
export function loadNotion() {
  Notion = new Client({ auth: process.env.notion });
}

type propType = 'page_id' | 'rich_text' | 'title' | 'number' | 'select';

type Property = 
  { type: 'rich_text', rich_text: RichText[] } |
  { type: 'title', title: RichText[] } |
  { type: 'number', number: number } |
  { type: 'select', select: Select };

export interface PropertyPayload {
  name: string;
  value: string | number;
  type: propType;
}

interface RichText {
  plain_text: string;
}

interface Select {
  name: string;
}

interface PropertyDiscriptor {
  name: string;
  type: propType;
}

interface PageObject {
  page_id: string;
}

function wrap_property(prop: PropertyPayload) {
  let obj;
  if (prop.type === 'title')     obj = [{ text: { content: prop.value } }];
  if (prop.type === 'rich_text') obj = [{ text: { content: prop.value } }];
  if (prop.type === 'select')    obj = { name: prop.value };
  if (prop.type === 'number')    obj = prop.value;

  const data: { [keys: string] : any } = {};
  data[prop.type] = obj;
  return data;
}

function unwrap_property(prop?: Property) {
  if (!prop) return;

  if (prop.type === 'title')     return prop[prop.type]?.[0].plain_text;
  if (prop.type === 'rich_text') return prop[prop.type]?.[0].plain_text;
  if (prop.type === 'number')    return prop.number;
  if (prop.type === 'select')    return prop.select?.name;
}

function getProperty(result: PageObjectResponse | PartialPageObjectResponse, name: string) {
  if ('properties' in result)
    return result.properties[name] as Property;
}

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

export class Block {
  block_id: string;

  constructor(block_id: string) {
    this.block_id = block_id;
  }

  async get_text() {
    const result = await Notion!.blocks.retrieve({
      block_id: this.block_id,
    });

    if ('paragraph' in result)
      return result.paragraph.rich_text[0].plain_text;
  }

  async update(new_string: string) {
    await Notion!.blocks.update({
      block_id: this.block_id,
      paragraph: { 'rich_text': [{ 'text': { 'content': new_string } }] },
    });
  }
}
