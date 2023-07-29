import path from 'path';
import express from 'express';
import { Express } from 'express';
import { pageList } from './pageList';
import { Bot } from '../bot';

class App {
  app: Express;

  constructor() {
    this.app = express();
    this.app.use(express.static(path.join(__dirname, 'static')));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));

    this.load_page();
  }

  load_page() {
    for (const page of pageList) {
      if (page.get)    this.app.get(page.path, page.get);
      if (page.post)   this.app.post(page.path, page.post);
      if (page.put)    this.app.put(page.path, page.put);
      if (page.patch)  this.app.patch(page.path, page.patch);
      if (page.delete) this.app.delete(page.path, page.delete);
    }
  }

  async start() {
    this.app.listen(8080, () => console.log('Listening on 8080'));
    await Bot.login();
  }
}

export const app = new App();
