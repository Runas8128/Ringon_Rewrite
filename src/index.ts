import path from "path";
import { config } from "dotenv";
import { DB_Manager } from "./bot/database";
import { select } from "./config/options/client_options";
import { loggerGen } from "./util/logger";
import { loadNotion } from "./util/notion";
import { app } from "./web";

loggerGen.setRoot(__dirname);
const logger = loggerGen.getLogger(__filename);

process.on('uncaughtException', error => {
  logger.error(error.stack);
});

(async () => {
  config({
    path: path.join(__dirname, 'config', 'env', select('prod.env', 'dev.env'))
  });
  loadNotion();

  await Promise.all([
    DB_Manager.load_all(),
    app.start(),
  ]);
})();
