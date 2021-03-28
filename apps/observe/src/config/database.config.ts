import * as config from 'config';
import { ConnectionOptions } from 'typeorm';

import { SettingsEntity } from 'apps/api/src/core/settings/settings.entity';
import { TradeEntity } from 'apps/api/src/core/trade/trade.entity';

const dbConfig = config.get('DATABASE');

process.env.TZ = 'UTC';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const ApiEntities = [TradeEntity, SettingsEntity];

export const DatabaseConfig: ConnectionOptions = {
  type: dbConfig.TYPE,
  url: dbConfig.URL,
  entities: ApiEntities,
  ssl: true,
  logging: ['error'],
  synchronize: dbConfig.SYNCHRONIZE,
};
