import { Page } from "../Page";

export const log: string[] = [];

export default {
  path: '/log',
  methods: ['post'],

  post: (req, resp) => {
    let new_log = '';
    req.on('readable', () => {
      let chunk;

      while ((chunk = req.read()) !== null) new_log += chunk;
    });
    req.on('end', () => {
      log.push(JSON.parse(new_log));
    });
  },
} as Page;
