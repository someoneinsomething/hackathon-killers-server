import { Controller, Get, Query } from '@nestjs/common';

import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Get('/statistics')
  getTradeStatistics(
    @Query('skip') skip: number,
    @Query('take') take: number,
  ): Promise<string> {
    return this.tradeService.getTradeStatistics(skip, take);
  }

  @Get('/statistics/hours')
  getProfitHoursStatistics(
    @Query('date') date: string,
    @Query('timezone') timezone: number,
  ): Promise<any> {
    return this.tradeService.getTradeHoursStatistics(date, timezone);
  }

  @Get('/statistics/days')
  getProfitDaysStatistics(
    @Query('date') date: string,
    @Query('timezone') timezone: number,
  ): Promise<any> {
    return this.tradeService.getTradeDaysStatistics(date, timezone);
  }

  @Get('/statistics/months')
  getProfitMonthsStatistics(
    @Query('date') date: string,
    @Query('timezone') timezone: number,
  ): Promise<any> {
    return this.tradeService.getTradeMonthsStatistics(date, timezone);
  }
}
