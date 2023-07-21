import { Client } from 'discord.js';

import { setup_event } from '../bot/event';
import { setup_command } from '../bot/command';
import { client_options } from '../config/options/client_options';

export class Bot {
  static token: string | undefined;
  static client: Client | undefined;

  static init() {
    this.token = process.env.discord;

    const client = new Client(client_options);
    setup_event(client);
    if (this.token) setup_command(client, this.token);

    this.client = client;
  }

  static async login() {
    while (!this.client);

    await this.client.login(this.token);
  }
}
