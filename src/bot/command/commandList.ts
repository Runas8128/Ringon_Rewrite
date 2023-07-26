import { Command } from "./Command";

import card_count from "./DB/card_count";
import IQ from "./DB/IQ";
import reload_db from "./DB/reload_db";
import search_card from "./DB/search_card";
import show_studied from "./DB/show_studied";
import update_card from "./DB/update_card";

import history_test from "./debug/history_test";

import analyze_deck from "./deck/analyze_deck";
import new_pack from "./deck/new_pack";
import portallink from "./deck/portallink";
import search_deck from "./deck/search_deck";

import check_reaction from "./other/check_reaction";

import latency from "./simple/latency";
import kill from "./simple/kill";
import prune from "./simple/prune";

export const commandList: Command[] = [
  card_count, IQ, reload_db, search_card, show_studied, update_card,
  history_test,
  analyze_deck, new_pack, portallink, search_deck,
  check_reaction,
  kill, latency, prune,
];
