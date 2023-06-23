import { log } from "./log";
import { Page } from "../Page";

export default {
  path: '/',
  methods: ['get'],

  get: (req, resp) => {
    resp.render('index', { stuffs: log });
  },
} as Page;
