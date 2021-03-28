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

  async getTradeStatistics(
    skip: number,
    take: number,
    profit: string,
  ): Promise<any> {
    const pagination: PaginationInterface = {
      skip: skip || 0,
      take: take || 15,
    };

    let trades;

    if (profit === 'true') {
      trades = await this.tradeRepository.getTradeProfitList(pagination);
    } else {
      trades = await this.tradeRepository.getTradeList(pagination);
    }

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

        if (profit === 'true') {
          if (profitAsk <= 0 && profitBid <= 0) {
            return null;
          }
        }

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
        amount: performedTrades.filter(item => !!item).length,
        list: performedTrades.filter(item => !!item),
      },
      data: {
        tradeBudget,
        commission: this.commission,
      },
    };
  }
}
