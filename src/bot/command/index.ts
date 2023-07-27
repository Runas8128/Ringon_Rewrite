import { Client, PermissionFlagsBits } from "discord.js";

import { Command } from "./Command";
import { fullCmdList } from "./commandList";
import { loggerGen } from "../../util/logger";
import { reply } from "../../util/misc";
import { isTesting } from "../../config/options/client_options";
import { guild } from "../../config/options/discord";

const logger = loggerGen.getLogger(__filename);

function preprocess() {
  fullCmdList
    .filter(c => c.perm === 'admin')
    .forEach(c => c.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator));
  
  return isTesting ? fullCmdList : fullCmdList.filter(c => c.perm !== 'dev');
}

async function deploy_commands(client: Client, commandList: Command[]) {
  logger.info('deploying commands');
  let loaded = 0;
  
  await Promise.all(
    commandList.map(
      ({ data }) => client.application?.commands
        .create(data.toJSON(), guild)
        .then(v => { loaded++; })
        .catch(r => { logger.warn(`An error occured while loading ${data.name}: ${r}`); })
    )
  );

  logger.info(`successfully loaded ${loaded}/${commandList.length} commands`);
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
      await reply(interaction, {
        content: `${interaction.commandName} 커맨드를 처리하는 동안 오류가 발생했습니다.`,
        ephemeral: true,
      });
      throw err;
    }
  });
}

export function setup_command(client: Client) {
  const list = preprocess();
  deploy_commands(client, list);
  add_command_listener(client, list);
}
