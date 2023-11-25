import axios from "axios";
import { config } from "dotenv";
import path, { relative } from "path";

import { select } from "./config/options/client_options";
config({ path: path.join(__dirname, 'config', 'env', select('prod.env', 'dev.env')) });

import { Logger } from "./logger";
import { app } from "./web";

Logger.root = __dirname;
const logger = Logger.getLogger(__filename);

process.on('uncaughtException', error => {
  logger.error(error.stack);
  if (error.stack) sendErrorWebhook(error.stack);
});

app.start();

async function sendErrorWebhook(error: string) {
  const [ cause, ...raw_stack ] = error.split('\n');

  const stack = raw_stack
    .map(s => s.replace('at ', '').split('('))
    .map(ss => [ss[0], hidePath(ss[1])])
    .map(ss => `${ss[1]}\n${ss[0]}\n`);

  await axios.post(
    process.env.webhook!,
    {
      avatar_url: process.env.avatar_url!,
      embeds: [buildEmbed(cause, stack)],
    },
  );
}

function buildEmbed(cause: string, stack: string[]) {
  return {
    title: cause,
    fields: [{ name: 'Call stack', value: stack.join('\n') }],
    timestamp: new Date().toISOString(),
  };
}

function hidePath(path: string) {
  path = path.replace(')', '').replaceAll('\\', '/');
  path = path.includes('node') ? path.slice(path.indexOf('node')) : relative(__dirname, path);
  const paths = path.split(':');
  const [col, line] = [paths.pop(), paths.pop()];
  path = `File ${paths.join(':')}, Line ${line}, Column ${col}`;

  return path;
}
