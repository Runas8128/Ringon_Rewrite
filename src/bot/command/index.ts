import { Client, PermissionFlagsBits, REST, Routes } from "discord.js";

import { Command } from "./Command";
import { commandList } from "./commandList";
import { client, guild } from "../../config/options/discord";
import { loggerGen } from "../../util/logger";
import { reply } from "../../util/misc";

const logger = loggerGen.getLogger(__filename);

function preprocess() {
  commandList
    .filter(c => c.perm === 'admin')
    .forEach(c => c.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator));
}

async function deploy_commands(token: string) {
  logger.info('deploying commands');

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    const data = await rest.put(
      Routes.applicationGuildCommands(client, guild),
      { body: commandList.map(command => command.data.toJSON()) },
    );
    if (((_: unknown): _ is any[] => true)(data))
      logger.info(`Successfully deployed ${data.length} commands.`);
  }
  catch (error) {
    logger.error(`Something bad happened. ${error}`);
  }
}

function add_command_listener(client: Client) {
  client.on('interactionCreate', async interaction => {
    if (!(interaction.isChatInputCommand() || interaction.isAutocomplete())) return;

    const command = commandList.find((cmd) => cmd.data.name === interaction.commandName);
    if (!command) return;

    if (interaction.isAutocomplete()) {
      if (command.autocompleter) command.autocompleter(interaction);
      return;
    }

    try {
      await command.execute(interaction);
    }
    catch(err) {
      await reply(interaction, {
        content: `${interaction.commandName} 커맨드를 처리하는 동안 오류가 발생했습니다.`,
        ephemeral: true,
      });
      throw err;
    }
  });
}

export function setup_command(client: Client, token: string) {
  preprocess();
  deploy_commands(token);
  add_command_listener(client);
}
