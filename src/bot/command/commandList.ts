import { Command } from "./Command";

import db from "./DB";
import debug from "./debug";
import deck from "./deck";
import other from "./other";
import simple from "./simple";

export const fullCmdList: Command[] = [
  ...db, ...debug, ...deck, ...other, ...simple
];
