import { Command } from "./Command";

import card from "./card";
import db from "./DB";
import debug from "./debug";
import deck from "./deck";
import other from "./other";
import simple from "./simple";

export const fullCmdList: Command[] = [
  ...card, ...db, ...debug, ...deck, ...other, ...simple
];
