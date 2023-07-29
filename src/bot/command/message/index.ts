import { ApplicationCommandType, Client } from "discord.js";
import { loggerGen } from "../../../util/logger";
import { mcList } from "./mcList";
import { guild } from "../../../config/options/discord";

const logger = loggerGen.getLogger(__filename);

async function deploy_commands(client: Client) {
  logger.info('deploying message commands');

  const result = await Promise.all(mcList.map(
    mc => (async () => {
      try {
        await client.application?.commands
          .create({ name: mc.name, type: ApplicationCommandType.Message }, guild);
        return true;
      }
      catch (r) {
        logger.warn(`An error occured while loading ${mc.name}: ${r}`);
        return false;
      }
    })()
  ));

  logger.info(`successfully loaded ${result.filter(r => r).length} commands`);
}

function add_command_listener(client: Client) {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const command = mcList.find(mc => mc.name === interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  });
}

export function setup_message_command(client: Client) {
  deploy_commands(client);
  add_command_listener(client);
}
