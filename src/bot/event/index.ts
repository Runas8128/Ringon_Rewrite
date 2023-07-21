import { Client } from "discord.js";
import { eventList } from "./eventList";

export function setup_event(client: Client) {
  for (const { once, name, execute } of eventList) {
    if (once) client.once(name, execute);
    else      client.on(name, execute);
  }
};
