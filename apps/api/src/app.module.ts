import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './core/settings/settings.module';
import { TradeModule } from './core/trade/trade.module';

@Module({
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    SettingsModule,
    TradeModule,
  ],
})
export class AppModule {}
