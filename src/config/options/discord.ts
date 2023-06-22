import { isTesting } from './client_options';

export const client = isTesting ? "850019210867376158" : "765462304350666762";
export const guild = isTesting ? "823359663973072957" : "758478112979288094";

export const role = {
  "all": isTesting ? "823388509670604840" : "840487847457718293",
};

export const channel = {
  "history": isTesting ? "1004611688802287626" : "804614670178320394",
  "main_notice": isTesting ? "854716123458043935" : "864518975253119007",
  "event_notice": isTesting ? "854716123458043935" : "765759817662857256",
};
