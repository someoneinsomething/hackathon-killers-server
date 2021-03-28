import { Controller, Get, Query } from '@nestjs/common';

import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Get('/statistics')
  getTradeStatistics(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('profit') profit: string,
  ): Promise<string> {
    return this.tradeService.getTradeStatistics(skip, take, profit);
  }
}
