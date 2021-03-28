import { Path } from '../../path';
import { Service } from '../../type';
import { Page } from 'puppeteer';

export class EtherscanService extends Service {
  async openPage(): Promise<Page> {
    const page = await this.module.browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    );

    await page.goto(Path.TOKEN_INFO);

    return page;
  }

  async getTokenAmount(name: string, page: Page): Promise<number> {
    const token = await page.$eval(`img[alt="${name}"]`, el => {
      const contentToken = el.parentElement.nextElementSibling.textContent;

      const performedToken = parseFloat(contentToken.replaceAll(',', ''));

      return performedToken;
    });

    return token;
  }
}
