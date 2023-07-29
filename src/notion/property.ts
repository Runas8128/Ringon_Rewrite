import { PageObjectResponse, PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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

export interface PropertyDiscriptor {
  name: string;
  type: propType;
}

export interface PageObject {
  page_id: string;
}

export function wrap_property(prop: PropertyPayload) {
  let obj;
  if (prop.type === 'title')     obj = [{ text: { content: prop.value } }];
  if (prop.type === 'rich_text') obj = [{ text: { content: prop.value } }];
  if (prop.type === 'select')    obj = { name: prop.value };
  if (prop.type === 'number')    obj = prop.value;

  const data: { [keys: string] : any } = {};
  data[prop.type] = obj;
  return data;
}

export function unwrap_property(prop?: Property) {
  if (!prop) return;

  if (prop.type === 'title')     return prop[prop.type]?.[0].plain_text;
  if (prop.type === 'rich_text') return prop[prop.type]?.[0].plain_text;
  if (prop.type === 'number')    return prop.number;
  if (prop.type === 'select')    return prop.select?.name;
}

export function getProperty(result: PageObjectResponse | PartialPageObjectResponse, name: string) {
  if ('properties' in result) return result.properties[name] as Property;
}
