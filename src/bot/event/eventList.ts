import { Event } from "./Event";
import ready from "./ready";
import btnClick from "./btnClick";
import detect from "./detect";
import detectDeckImg from "./detectDeckImg";
import uploadDeck from "./uploadDeck";
import memberLeft from "./memberLeft";

export const eventList: Event[] = [
  ready, btnClick, detect, memberLeft
];
