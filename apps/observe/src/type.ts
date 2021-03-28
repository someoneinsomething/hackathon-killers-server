import { Path } from './path';
import { Browser, Page } from 'puppeteer';

export interface ModuleProps {
  browser: Browser;
}

interface ModuleState {
  browser: Browser;
  config: any;
  page: Page | null;
}

export class Module implements ModuleState {
  browser: Browser;
  page: Page;

  constructor(props: ModuleProps) {
    this.browser = props.browser;
  }

  path = Path;
  config = {};
}

export interface ServiceProps {
  browser: Browser;
  page: Page;
}

export class Service {
  module: ModuleState;

  constructor(module: ModuleState) {
    this.module = module;
  }
}
