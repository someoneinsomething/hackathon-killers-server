import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import { SettingsEntity } from '../core/settings/settings.entity';
import { TradeEntity } from '../core/trade/trade.entity';

const dbConfig = config.get('DATABASE');

process.env.TZ = 'UTC';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const ApiEntities = [TradeEntity, SettingsEntity];

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.TYPE,
  url: process.env.DATABASE_URL || dbConfig.URL,
  entities: ApiEntities,
  ssl: true,
  logging: ['error'],
  synchronize: process.env.DATABASE_SYNCHRONIZE || dbConfig.SYNCHRONIZE,
};
