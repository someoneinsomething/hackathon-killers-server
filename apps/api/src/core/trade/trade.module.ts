import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsRepostiory } from '../settings/settings.repository';
import { SettingsService } from '../settings/settings.service';
import { TradeController } from './trade.controller';
import { TradeRepository } from './trade.repository';
import { TradeService } from './trade.service';

@Module({
  imports: [TypeOrmModule.forFeature([TradeRepository, SettingsRepostiory])],
  controllers: [TradeController],
  providers: [TradeService, SettingsService],
  exports: [TradeService],
})
export class TradeModule {}
