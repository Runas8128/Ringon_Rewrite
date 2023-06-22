import { DB_Manager } from "./bot/database";
import { app } from "./web";
import { env_init } from "./util/env";
import { loggerGen } from "./util/logger";

loggerGen.setRoot(__dirname);
const logger = loggerGen.getLogger(__filename);

process.on('uncaughtException', (error) => {
  logger.error(error.stack);
});

env_init();
DB_Manager.load_all();
app.start();
