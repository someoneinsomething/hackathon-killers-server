import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { SettingsRepostiory } from './settings.repository';
import { SettingsEntity } from './settings.entity';
import { UpdateSettingsTradeBudgetDto } from './dto/update-settings-trade-budget.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsRepostiory)
    private settingsRepostiory: SettingsRepostiory,
  ) {}

  async getSettings(): Promise<SettingsEntity> {
    const data = await this.settingsRepostiory.findOne({ where: { id: 1 } });

    if (!data) {
      const settings = await this.createSettingsEntity();

      return settings;
    }

    return data;
  }

  async createSettingsEntity(): Promise<SettingsEntity> {
    const settings = new SettingsEntity();

    settings.id = 1;
    settings.tradeBudget = 500;

    await settings.save();

    return settings;
  }

  async getTradeBudget(): Promise<number> {
    const settings = await this.getSettings();

    const { tradeBudget } = settings;

    return tradeBudget;
  }

  async updateSettingsTradeBudget(
    updateSettingsTradeBudget: UpdateSettingsTradeBudgetDto,
  ): Promise<void> {
    const settings = await this.getSettings();

    const { tradeBudget } = updateSettingsTradeBudget;

    settings.tradeBudget = tradeBudget;

    await settings.save();
  }
}
