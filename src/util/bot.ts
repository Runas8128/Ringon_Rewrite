import { Client } from 'discord.js';

import { setup_event } from '../bot/event';
import { setup_command } from '../bot/command';
import { client_options, isTesting } from '../config/options/client_options';
import { setup_message_command } from '../bot/command/message';

export class Bot {
  static client?: Client;

  static init() {
    this.client = new Client(client_options);
  }

  static async login() {
    while (!this.client);
    setup_event(this.client);
    
    await this.client.login(process.env.discord);

    this.client.user?.setPresence({
      status: 'idle',
      activities: [{ name: '커맨드를 로드' }],
    });
  
    await Promise.all([
      setup_command(this.client),
      setup_message_command(this.client),
    ]);

    this.client!.user?.setPresence({
      status: isTesting ? 'dnd' : 'online',
      activities: isTesting ? [{ name: '버그 수정' }] : [],
    });
  }
}
