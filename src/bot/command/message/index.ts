import { ApplicationCommandType, Client } from "discord.js";

import { mcList } from "./mcList";
import { MessageCommand } from "./messageCommand";
import { guild } from "../../../config/options/discord";
import { loggerGen } from "../../../logger";

const logger = loggerGen.getLogger(__filename);

async function deploy(client: Client, mc: MessageCommand) {
  try {
    await client.application?.commands
      .create({ name: mc.name, type: ApplicationCommandType.Message }, guild);
    return true;
  }
  catch (r) {
    logger.warn(`An error occured while loading ${mc.name}: ${r}`);
    return false;
  }
}

async function deploy_commands(client: Client) {
  logger.info('deploying message commands');
  const result = await Promise.all(mcList.map(mc => deploy(client, mc)));
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

export async function setup_message_command(client: Client) {
  await deploy_commands(client);
  add_command_listener(client);
}
