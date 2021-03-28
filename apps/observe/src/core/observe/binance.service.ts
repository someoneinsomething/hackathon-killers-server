import { Page } from 'puppeteer';

import { Path } from '../../path';
import { Service } from '../../type';

export class BinanceService extends Service {
  async openPage(firstPair: string, secondPair: string): Promise<Page> {
    const page = await this.module.browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    );

    await page.goto(Path.BINANCE_TRADE(firstPair, secondPair));

    const closePopup = await page.$('.css-8qwo6f');
    if (closePopup) {
      await closePopup.click();
    }

    return page;
  }

  async getCryptoPrice({ page, tradeBudget, revert = false }): Promise<any> {
    const price = await page.$eval('div.showPrice', el => {
      const performedPrice = el.textContent.replaceAll(',', '');
      const priceNumber = parseFloat(performedPrice);

      return priceNumber;
    });

    if (!tradeBudget) {
      return { course: price };
    }

    const commission = 0.998;

    if (revert) {
      const profit = tradeBudget / price;

      return { price: profit * commission, course: price };
    }

    const profit = tradeBudget * price;

    return { price: profit * commission, course: price };
  }

  async getMarketDepth({ page, type }): Promise<any> {
    if (type === 'ASK') {
      const button = await page.$('.css-1f9551p:nth-of-type(3) button');
      if (button) {
        await button.click();
      }
    }

    if (type === 'BID') {
      const button = await page.$('.css-1f9551p:nth-of-type(2) button');
      if (button) {
        await button.click();
      }
    }

    const selector =
      type === 'ASK'
        ? '.orderlist-container .orderbook-list:nth-of-type(1) .row-content'
        : type === 'BID'
        ? '.orderlist-container .orderbook-list:nth-of-type(2) .row-content'
        : null;

    const depth = await page.$$eval(selector, list =>
      list
        .map(item => {
          const { children } = item;

          const price = parseFloat(children[0].textContent.replaceAll(',', '')); // USD
          const amount = parseFloat(
            children[1].textContent.replaceAll(',', ''),
          ); // BTC
          const total = parseFloat(children[2].textContent.replaceAll(',', '')); // USD

          return { price, amount, total };
        })
        .sort((a, b) => a.price - b.price),
    );

    return depth;
  }

  async getCryptoPriceWithMarketDepth({
    depth,
    amount,
    revert = false,
  }): Promise<any> {
    const performedDepth = [];

    let tempAmount = amount;

    for (let i = 0; i < depth.length; i++) {
      const item = depth[i];

      if (tempAmount <= 0) {
        break;
      }

      if (item.amount < tempAmount) {
        tempAmount = tempAmount - item.amount;
        performedDepth.push(item);
        continue;
      }

      if (item.amount > tempAmount) {
        performedDepth.push({
          ...item,
          amount: tempAmount,
          total: tempAmount * item.price,
        });

        tempAmount = 0;
        continue;
      }
    }

    const dephtAmount = performedDepth.reduce((accum, item) => {
      return accum + item.amount;
    }, 0);

    const depthTotal = performedDepth.reduce((accum, item) => {
      return accum + item.total;
    }, 0);

    const price = depthTotal / dephtAmount;

    if (!amount) {
      return { course: price, depth: performedDepth };
    }

    const commission = 0.998;

    if (revert) {
      const profit = amount / price;

      return {
        price: profit * commission,
        course: price,
        depth: performedDepth,
      };
    }

    const profit = amount * price;

    return { price: profit * commission, course: price, depth: performedDepth };
  }
}
