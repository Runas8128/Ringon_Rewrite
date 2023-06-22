import { Client } from "discord.js";
import { eventList } from "./eventList";

export function setup_event(client: Client) {
  for (const event of eventList) {
    if (event.once) {
      client.once(event.name, event.execute);
    }
    else {
      client.on(event.name, event.execute);
    }
  }
};
