import { APIEmbedField } from "discord.js";
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
    if (b) {
      const targets = b.map(r => r.result), weights = b.map(r => r.ratio);
      const total_weight = weights.reduce((prev, curr) => prev + curr, 0);
      const weighted_random = Math.random() * total_weight;
      const last_index = targets.length - 1;
      let current_weight = 0;
    
      for (let i = 0; i < last_index; ++i) {
        current_weight += weights[i];
        if (weighted_random < current_weight) return targets[i];
      }
    
      return targets[last_index];
    }
  }

  static async getCount() {
    return this.full.length + new Set(this.prob.map(o => o.target)).size;
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
      value: obj.result.length > 50 ?
        obj.result.substring(0, 47) + '...' :
        obj.result,
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
