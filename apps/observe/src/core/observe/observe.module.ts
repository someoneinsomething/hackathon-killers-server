import { Page } from 'puppeteer';
import { getRepository } from 'typeorm';

import { SettingsEntity } from 'apps/api/src/core/settings/settings.entity';
import { Module, ModuleProps } from '../../type';
import { EtherscanService } from './etherscan.service';
import { ObserveService } from './observe.service';
import { BinanceService } from './binance.service';
import { TradeEntity } from 'apps/api/src/core/trade/trade.entity';
import { Logger } from '../../utils/Logger.utils';

export class ObserveModule extends Module {
  observeService: ObserveService;
  etherscanService: EtherscanService;
  binanceService: BinanceService;

  etherscanPage: Page;
  binanceEthToUsdPage: Page;
  binanceTokenToUsdPage: Page;

  constructor(props: ModuleProps) {
    super(props);

    this.observeService = new ObserveService(this);
    this.etherscanService = new EtherscanService(this);
    this.binanceService = new BinanceService(this);
  }

  async openPages(): Promise<void> {
    const etherscanPage = await this.etherscanService.openPage();
    const binanceEthToUsdPage = await this.binanceService.openPage(
      'ETH',
      'USDT',
    );
    const binanceTokenToUsdPage = await this.binanceService.openPage(
      'YFI',
      'USDT',
    );

    this.etherscanPage = etherscanPage;
    this.binanceEthToUsdPage = binanceEthToUsdPage;
    this.binanceTokenToUsdPage = binanceTokenToUsdPage;
  }

  async getComputedTokenAmount(): Promise<any> {
    await this.etherscanPage.reload();

    const token = await this.etherscanService.getTokenAmount(
      'YFI',
      this.etherscanPage,
    );
    const weth = await this.etherscanService.getTokenAmount(
      'WETH',
      this.etherscanPage,
    );

    return { token, weth };
  }

  async saveTrade({
    weth,
    token,
    tokenUsdtCourse,
    tokenUsdtCourseDepthAsk,
    tokenUsdtCourseDepthBid,
    ethUsdtCourse,
  }): Promise<void> {
    const trade = new TradeEntity();

    trade.weth = weth;
    trade.token = token;
    trade.tokenUsdtCourseDepthBid = tokenUsdtCourseDepthBid;
    trade.tokenUsdtCourseDepthAsk = tokenUsdtCourseDepthAsk;
    trade.tokenUsdtCourse = tokenUsdtCourse;
    trade.ethUsdtCourse = ethUsdtCourse;

    await trade.save();
  }

  async main(): Promise<void> {
    Logger.log('Process start');

    Logger.log('Start computing token');

    const { token, weth } = await this.getComputedTokenAmount();

    Logger.log('End computing token');

    Logger.log('Start converting eth to dollars');

    const { tradeBudget } = await getRepository(SettingsEntity).findOne({
      where: { id: 1 },
    });

    const {
      price: amountEth,
      course: ethUsdtCourse,
    } = await this.binanceService.getCryptoPrice({
      page: this.binanceEthToUsdPage,
      tradeBudget,
      revert: true,
      // amount: null,
    });

    Logger.log('End converting eth to USDT');

    Logger.log('Start calculating token difference');

    const {
      calculatedAmount,
      // pool,
      // newValue,
    } = this.observeService.calculateTokenDifference({
      token,
      weth,
      amount: amountEth,
    });

    Logger.log('End calculating token difference');

    Logger.log('Start converting token to USDT');

    const {
      // price: calculatedAmountDollars,
      course: tokenUsdtCourse,
    } = await this.binanceService.getCryptoPrice({
      page: this.binanceTokenToUsdPage,
      // amount: calculatedAmount,
      tradeBudget: null,
    });

    const marketDepthBid = await this.binanceService.getMarketDepth({
      page: this.binanceTokenToUsdPage,
      type: 'BID',
    });

    const marketDepthAsk = await this.binanceService.getMarketDepth({
      page: this.binanceTokenToUsdPage,
      type: 'ASK',
    });

    const {
      course: tokenUsdtCourseDepthBid,
    } = await this.binanceService.getCryptoPriceWithMarketDepth({
      depth: marketDepthBid,
      amount: calculatedAmount,
    });

    const {
      course: tokenUsdtCourseDepthAsk,
    } = await this.binanceService.getCryptoPriceWithMarketDepth({
      depth: marketDepthAsk,
      amount: calculatedAmount,
    });

    if (!tokenUsdtCourseDepthBid || !tokenUsdtCourseDepthAsk) {
      return null;
    }

    Logger.log('End converting token to dollars');

    Logger.log('Start saving trade');

    await this.saveTrade({
      weth,
      token,
      tokenUsdtCourse,
      tokenUsdtCourseDepthBid,
      tokenUsdtCourseDepthAsk,
      ethUsdtCourse,
    });

    Logger.log('End saving trade');

    Logger.log('Process end');
  }

  async observe(): Promise<void> {
    await this.main();
    setInterval(async () => {
      await this.main();
    }, 1000 * 2);
  }
}
