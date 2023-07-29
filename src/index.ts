import path from "path";
import { config } from "dotenv";
import { select } from "./config/options/client_options";
import { DB_Manager } from "./database";
import { loggerGen } from "./logger";
import { loadNotion } from "./notion";
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
