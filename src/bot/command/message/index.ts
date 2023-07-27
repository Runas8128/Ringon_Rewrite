import { Client, REST, Routes } from "discord.js";
import { client, guild } from "../../../config/options/discord";
import { loggerGen } from "../../../util/logger";
import { mcList } from "./mcList";

const logger = loggerGen.getLogger(__filename);

async function deploy_commands(token: string) {
  logger.info('deploying message commands');

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    const data = await rest.put(
      Routes.applicationGuildCommands(client, guild),
      { body: mcList.map(command => ({ name: command.name, type: 3 })) },
    );
    if (((_: unknown): _ is any[] => true)(data))
      logger.info(`Successfully deployed ${data.length} message commands.`);
  }
  catch (error) {
    logger.error(`Something bad happened. ${error}`);
  }
}

function add_command_listener(client: Client) {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isMessageContextMenuCommand()) return;

    const command = mcList.find(mc => mc.name === interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  });
}

export function setup_message_command(client: Client, token: string) {
  deploy_commands(token);
  add_command_listener(client);
}

