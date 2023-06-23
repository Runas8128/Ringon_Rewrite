import { Client } from 'discord.js';

import { setup_event } from '../bot/event';
import { setup_command } from '../bot/command';
import { intents, partials, isTesting } from '../config/options/client_options';

export class Bot {
  static token: string | undefined;
  static client: Client | undefined;

  static init() {
    this.token = process.env.discord;

    const client = new Client({ intents, partials });
    setup_event(client);
    if (this.token) setup_command(client, this.token);

    this.client = client;
  }

  static async login() {
    while (!this.client);

    await this.client.login(this.token);

    if (!isTesting) return;
    this.client.on('ready', async () => {
      this.client!.user?.setPresence({
        status: 'dnd',
        activities: [{ name: '버그 수정' }],
      });
    });
  }
}
