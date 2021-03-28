import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObserveService } from 'apps/observe/src/core/observe/observe.service';
import { TradeRepository } from './trade.repository';
import { PaginationInterface } from '../../interfaces/pagination.interface';
import { SettingsService } from '../settings/settings.service';
import { TradeEntity } from './trade.entity';

@Injectable()
export class TradeService {
  commission: number;
  observeService: ObserveService;

  constructor(
    @InjectRepository(TradeRepository)
    private tradeRepository: TradeRepository,
    private settingsService: SettingsService,
  ) {
    this.commission = 0.998;
    this.observeService = new ObserveService(null);
  }

  async getTradeStatistics(skip: number, take: number): Promise<any> {
    const pagination: PaginationInterface = {
      skip: skip || 0,
      take: take || 15,
    };

    const trades = await this.tradeRepository.getTradeList(pagination);

    const tradeBudget = await this.settingsService.getTradeBudget();

    const performedTrades = trades.list.map(
      ({
        id,
        createDate,
        token,
        weth,
        ethUsdtCourse,
        tokenUsdtCourse,
        tokenUsdtCourseDepthAsk,
        tokenUsdtCourseDepthBid,
      }) => {
        const amountEth = (tradeBudget / ethUsdtCourse) * this.commission;
        const amountToken =
          (tradeBudget / tokenUsdtCourseDepthAsk) * this.commission;

        const {
          calculatedAmount: calculatedAmountAsk,
          pool,
          newValue: newValueAsk,
        } = this.observeService.calculateTokenDifference({
          token,
          weth,
          amount: amountToken,
          revert: true,
        });

        const {
          calculatedAmount: calculatedAmountBid,
          newValue: newValueBid,
        } = this.observeService.calculateTokenDifference({
          token,
          weth,
          amount: amountEth,
        });

        const binanceAsk =
          calculatedAmountAsk * ethUsdtCourse * this.commission;
        const binanceBid =
          calculatedAmountBid * tokenUsdtCourseDepthBid * this.commission;

        const profitAsk = Number((binanceAsk - tradeBudget).toFixed(2));
        const profitBid = Number((binanceBid - tradeBudget).toFixed(2));

        return {
          id,
          createDate,
          token,
          weth,
          ethUsdtCourse,
          tokenUsdtCourse,
          tokenUsdtCourseDepthAsk,
          tokenUsdtCourseDepthBid,
          pool,
          profitAsk,
          profitBid,
          amountEth,
          amountToken,
          newValueAsk,
          newValueBid,
          calculatedAmountAsk,
          calculatedAmountBid,
          binanceAsk,
          binanceBid,
        };
      },
    );

    return {
      list: {
        ...trades,
        list: performedTrades,
      },
      data: {
        tradeBudget,
        commission: this.commission,
      },
    };
  }

  async getTradeProfit(trades: TradeEntity[]): Promise<any> {
    const tradeBudget = await this.settingsService.getTradeBudget();

    const profit = trades.reduce(
      (
        accum,
        {
          token,
          weth,
          ethUsdtCourse,
          tokenUsdtCourseDepthAsk,
          tokenUsdtCourseDepthBid,
        },
      ) => {
        const amountEth = (tradeBudget / ethUsdtCourse) * this.commission;
        const amountToken =
          (tradeBudget / tokenUsdtCourseDepthAsk) * this.commission;

        const {
          calculatedAmount: calculatedAmountAsk,
        } = this.observeService.calculateTokenDifference({
          token,
          weth,
          amount: amountToken,
          revert: true,
        });

        const {
          calculatedAmount: calculatedAmountBid,
        } = this.observeService.calculateTokenDifference({
          token,
          weth,
          amount: amountEth,
        });

        const binanceAsk =
          calculatedAmountAsk * ethUsdtCourse * this.commission;
        const binanceBid =
          calculatedAmountBid * tokenUsdtCourseDepthBid * this.commission;

        const profitAsk = binanceAsk - tradeBudget;
        const profitBid = binanceBid - tradeBudget;

        if (profitAsk > 0) {
          return accum + profitAsk;
        }

        if (profitBid > 0) {
          return accum + profitBid;
        }

        return accum;
      },
      0,
    );

    return profit;
  }

  convertPickerDate = (date: Date): any => {
    const rawDate = date.getDate();

    const rawHours = date.getHours();
    const hours = `${rawHours < 10 ? '0' : ''}${rawHours}`;
    const days = `${rawDate < 10 ? '0' : ''}${rawDate}`;
    const rawMonth = date.getMonth() + 1;
    const month = `${rawMonth < 10 ? '0' : ''}${rawMonth}`;
    const rawFullYear = date.getFullYear();
    const years = `${rawFullYear}`;

    const formattedDate = `${years}-${month}-${days} ${hours}:00`;

    return formattedDate;
  };

  async getTradeHoursStatistics(date: string, timezone: number): Promise<any> {
    const hours = [
      {
        from: 0,
        to: 2,
      },
      {
        from: 2,
        to: 4,
      },
      {
        from: 4,
        to: 6,
      },
      {
        from: 6,
        to: 8,
      },
      {
        from: 8,
        to: 10,
      },
      {
        from: 10,
        to: 12,
      },
      {
        from: 12,
        to: 14,
      },
      {
        from: 14,
        to: 16,
      },
      {
        from: 16,
        to: 18,
      },
      {
        from: 18,
        to: 20,
      },
      {
        from: 20,
        to: 22,
      },
      {
        from: 22,
        to: 24,
      },
    ];

    const formattedDate = new Date(
      new Date(date).getTime() + timezone * 1000 * 60 * 60,
    );

    const data = await Promise.all(
      hours.map(async ({ from, to }) => {
        const fromDate = new Date(
          new Date(formattedDate).getTime() + from * 1000 * 60 * 60,
        );

        const toDate = new Date(
          new Date(formattedDate).getTime() + to * 1000 * 60 * 60,
        );

        const convertedFrom = this.convertPickerDate(fromDate);
        const convertedTo = this.convertPickerDate(toDate);

        const trades = await this.tradeRepository.getTradeHoursStatistics(
          convertedFrom,
          convertedTo,
        );

        const profit = await this.getTradeProfit(trades);

        return {
          date: {
            from: new Date(convertedFrom),
            to: new Date(convertedTo),
          },
          profit: Number(profit.toFixed(2)),
        };
      }),
    );

    return data;
  }

  async getTradeDaysStatistics(date: string, timezone: number): Promise<any> {
    const formattedDate = new Date(
      new Date(date).getTime() + timezone * 1000 * 60 * 60,
    );

    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();

    const daysLength = [
      31,
      new Date(year, 1, 29).getMonth() === 1 ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];

    const days = new Array(daysLength[month])
      .fill(null)
      .map((_, index) => index);

    const data = await Promise.all(
      days.map(async (day, index) => {
        const fromDate = new Date(
          new Date(formattedDate).getTime() + index * 1000 * 60 * 60 * 24,
        );

        const toDate = new Date(
          new Date(formattedDate).getTime() + (index + 1) * 1000 * 60 * 60 * 24,
        );

        const convertedFrom = this.convertPickerDate(fromDate);
        const convertedTo = this.convertPickerDate(toDate);

        const trades = await this.tradeRepository.getTradeHoursStatistics(
          convertedFrom,
          convertedTo,
        );

        const profit = await this.getTradeProfit(trades);

        return {
          date: day,
          profit: Number(profit.toFixed(2)),
        };
      }),
    );

    return data;
  }

  async getTradeMonthsStatistics(date: string, timezone: number): Promise<any> {
    const formattedDate = new Date(
      new Date(date).getTime() + timezone * 1000 * 60 * 60,
    );

    const months = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
    ];

    const data = await Promise.all(
      months.map(async (month, index) => {
        const fromDate = new Date(
          new Date(formattedDate).getTime() + index * 1000 * 60 * 60 * 24 * 30,
        );

        const toDate = new Date(
          new Date(formattedDate).getTime() +
            (index + 1) * 1000 * 60 * 60 * 24 * 30,
        );

        const convertedFrom = this.convertPickerDate(fromDate);
        const convertedTo = this.convertPickerDate(toDate);

        const trades = await this.tradeRepository.getTradeHoursStatistics(
          convertedFrom,
          convertedTo,
        );

        const profit = await this.getTradeProfit(trades);

        return {
          date: month,
          profit: Number(profit.toFixed(2)),
        };
      }),
    );

    return data;
  }
}
