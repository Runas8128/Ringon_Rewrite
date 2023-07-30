import { Client, PermissionFlagsBits } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { Command } from "./Command";
import { fullCmdList } from "./commandList";
import { isTesting } from "../../config/options/client_options";
import { guild } from "../../config/options/discord";
import { loggerGen } from "../../logger";

const logger = loggerGen.getLogger(__filename);

function preprocess() {
  fullCmdList
    .filter(c => c.perm === 'admin')
    .forEach(c => c.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator));
  
  return isTesting ? fullCmdList : fullCmdList.filter(c => c.perm !== 'dev');
}

async function deploy(client: Client, data: SlashCommandBuilder) {
  try {
    await client.application?.commands
      .create(data.toJSON(), guild);
    return true;
  }
  catch (r) {
    logger.warn(`An error occured while loading ${data.name}: ${r}`);
    return false;
  }
}

async function deploy_commands(client: Client, commandList: Command[]) {
  logger.info('deploying commands');
  const result = await Promise.all(commandList.map(cmd => deploy(client, cmd.data)));
  logger.info(`successfully loaded ${result.filter(r => r).length} commands`);
}

function add_command_listener(client: Client, commandList: Command[]) {
  client.on('interactionCreate', async interaction => {
    if (!(interaction.isChatInputCommand() || interaction.isAutocomplete())) return;

    const command = commandList.find(cmd => cmd.data.name === interaction.commandName);
    if (!command) return;

    if (interaction.isAutocomplete()) {
      if (command.autocompleter) command.autocompleter(interaction);
      return;
    }

    try {
      await command.execute(interaction);
    }
    catch(err) {
      const notifyContent = {
        content: `${interaction.commandName} 커맨드를 처리하는 동안 오류가 발생했습니다.`,
        ephemeral: true,
      };
      if (interaction.deferred || interaction.replied) await interaction.editReply(notifyContent);
      else await interaction.reply(notifyContent);
      throw err;
    }
  });
}

export async function setup_command(client: Client) {
  const list = preprocess();
  await deploy_commands(client, list);
  add_command_listener(client, list);
}
