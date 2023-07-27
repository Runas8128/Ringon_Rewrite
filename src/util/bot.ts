import { Client } from 'discord.js';

import { setup_event } from '../bot/event';
import { setup_command } from '../bot/command';
import { client_options } from '../config/options/client_options';
import { setup_message_command } from '../bot/command/message';

export class Bot {
  static token?: string;
  static client?: Client;

  static init() {
    this.token = process.env.discord;

    const client = new Client(client_options);
    setup_event(client);
    setup_command(client);
    setup_message_command(client);
    
    this.client = client;
  }

  static async login() {
    while (!this.client);

    await this.client.login(this.token);
  }
}
