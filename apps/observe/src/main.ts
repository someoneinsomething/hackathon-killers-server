import * as Puppeteer from 'puppeteer';
// import dappeteer from 'dappeteer';
import { initDatabaseConnection } from './database';

import { Logger } from './utils/Logger.utils';
import { ObserveModule } from './core/observe/observe.module';

const bootstrap = async () => {
  await initDatabaseConnection();

  const browser = await Puppeteer.launch({
    headless: process.env.NODE_ENV === 'production',
    // headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const moduleProps = { browser };

  const observeModule = new ObserveModule(moduleProps);

  Logger.log('Start open pages');
  await observeModule.openPages();
  Logger.log('End open pages');

  Logger.log('Start observing');

  await observeModule.observe();

  // const browser = await Puppeteer.launch({
  //   headless: process.env.NODE_ENV === 'production',
  //   // headless: true,
  //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
  // });

  // const page = await browser.newPage();

  // await page.setUserAgent(
  //   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
  // );

  // const metamask = await dappeteer.getMetamask(browser);

  // metamask.importAccount(
  //   'eebe009559a296b24dee46078ffe1e4a5c8fa88c918b070363c44e993392c084',
  //   'vanyaebower1337',
  // );

  // await page.goto('https://app.uniswap.org/#/swap');
};

bootstrap();
