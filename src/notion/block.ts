import { Notion } from "./notion";

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
