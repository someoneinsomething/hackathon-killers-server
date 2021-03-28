import { Repository, EntityRepository } from 'typeorm';
import { PaginationInterface } from '../../interfaces/pagination.interface';
import { GetTradeListPaginationDto } from './dto/get-trade-list-pagination.dto';
import { TradeEntity } from './trade.entity';

@EntityRepository(TradeEntity)
export class TradeRepository extends Repository<TradeEntity> {
  async getTradeList(
    pagination: PaginationInterface,
  ): Promise<GetTradeListPaginationDto> {
    const { skip, take } = pagination;

    const query = this.createQueryBuilder('trade');

    if (skip) {
      query.offset(Number(skip));
    }

    if (take) {
      query.limit(Number(take));
    }

    query.orderBy('trade.createDate', 'DESC');

    const [list, amount] = await query.getManyAndCount();

    return {
      list,
      amount,
      take,
      skip,
    };
  }

  async getTradeHoursStatistics(from: string, to: string): Promise<any> {
    const query = this.createQueryBuilder('trade');

    query.where(
      `trade."createDate" >= '${from}:00.000000' AND trade."createDate" < '${to}:00.000000'`,
    );

    const list = await query.getMany();

    return list;
  }
}
