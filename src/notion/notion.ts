import { Client } from "@notionhq/client";

export let Notion: Client | undefined = undefined;

export function loadNotion() {
  Notion = new Client({ auth: process.env.notion });
}
