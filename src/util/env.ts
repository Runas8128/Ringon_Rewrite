import path from 'path';
import { config } from 'dotenv';
import { Bot } from './bot';
import { Notion } from './notion';
import { isTesting } from '../config/options/client_options';

export function env_init() {
  config({
    path: path.join(
      __dirname, '..', 'config', 'env',
      isTesting ? 'dev.env' : 'prod.env'
    )
  });
  Bot.init();
  Notion.init();
}
