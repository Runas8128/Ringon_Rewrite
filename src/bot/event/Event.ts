import { Awaitable } from "discord.js";

export interface Event {
  name: string;
  once: boolean;
  execute: (...args: any[]) => Awaitable<void>;
}
