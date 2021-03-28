import { TradeEntity } from '../trade.entity';

export interface GetTradeListPaginationDto {
  list: TradeEntity[];
  skip: number;
  take: number;
  amount: number;
}
