import path from 'path';
import { config } from 'dotenv';
import { Notion } from './notion';
import { select } from '../config/options/client_options';

export function env_init() {
  config({
    path: path.join(__dirname, '..', 'config', 'env', select('prod.env', 'dev.env'))
  });
  Notion.init();
}
