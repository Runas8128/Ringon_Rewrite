import path from "path";

import { config } from "dotenv";

import { select } from "./config/options/client_options";
import { Logger } from "./logger";
import { app } from "./web";

Logger.root = __dirname;
const logger = Logger.getLogger(__filename);

process.on('uncaughtException', error => {
  logger.error(error.stack);
});

config({ path: path.join(__dirname, 'config', 'env', select('prod.env', 'dev.env')) });
app.start();
