import { APIEmbedField } from "discord.js";
import { cut, select_weight } from "./misc";
import { MongoDB } from "./mongodb";
import { FullDetectObj, ProbDetectObj } from "./schema";

export class detectManager {
  static full: FullDetectObj[] = [];
  static prob: ProbDetectObj[] = [];
  static loaded: boolean = false;

  static async load() {
    if (this.loaded) return;
    this.loaded = true;
    this.full = await MongoDB.full.find().toArray();
    this.prob = await MongoDB.prob.find().toArray();
  }

  static async detect(content: string) {
    await this.load();

    const a = this.full.find(o => o.target === content);
    if (a) return a.result;

    const b = this.prob.filter(o => o.target === content);
    if (b) return select_weight(b.map(r => r.result), b.map(r => r.ratio));
  }

  static async getFields() {
    await this.load();
    const fields: APIEmbedField[] =
      this.full.map(this.fullParse)
      .concat(this.prob.map(o => o.target).map(this.probParse));

    return fields.length > 0 ?
      fields :
      [{ name: '엥 비어있네요', value: '왜지...', inline: true }];
  }

  static fullParse(obj: FullDetectObj) {
    return {
      name: obj.target,
      value: cut(obj.result, 50),
      inline: true,
    } as APIEmbedField;
  }

  static probParse(tar: string) {
    return {
      name: tar,
      value: this.probVal(tar),
      inline: false,
    } as APIEmbedField;
  }

  static probVal(tar: string) {
    const a = this.prob.filter(o => o.target === tar)
      .map(obj => `${obj.result} (가중치: ${obj.ratio})`);
    return a.join('\n');
  }
}
