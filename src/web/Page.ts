import { RequestHandler } from 'express';

export interface Page {
  path: string;
  methods: ('get' | 'post' | 'put' | 'patch' | 'delete')[];

  get?: RequestHandler;
  post?: RequestHandler;
  put?: RequestHandler;
  patch?: RequestHandler;
  delete?: RequestHandler;
};
