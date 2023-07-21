import { ButtonInteraction, Events, Interaction } from "discord.js";
import { ButtonBuilder } from "@discordjs/builders";
import { Event } from "./Event";

type BtnCallback = (interaction: ButtonInteraction) => Promise<void>;

interface BtnRegisterObj {
  button: ButtonBuilder;
  callback: BtnCallback;
}

class ClickEventHandler {
  button_map: BtnRegisterObj[];

  constructor() {
    this.button_map = [];
  }

  register(callback: BtnCallback) {
    const button = new ButtonBuilder();
    this.button_map.push({
      button: button,
      callback: callback,
    });
    return button;
  }
}

export const eventHandler = new ClickEventHandler();

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: Interaction) {
    if (!interaction.isButton()) return;

    const button = eventHandler.button_map.find(obj =>
      'custom_id' in obj.button.data &&
      obj.button.data.custom_id === interaction.customId
    );
    await button?.callback(interaction);
  },
} as Event;
