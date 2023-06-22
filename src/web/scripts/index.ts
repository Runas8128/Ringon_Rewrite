import { Page } from "../Page";

export default {
  path: '/',
  methods: ['get'],

  get: (req, resp) => {
    resp.render('index');
  },
} as Page;
