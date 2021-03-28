import { Body, Controller, Get, Patch, ValidationPipe } from '@nestjs/common';
import { UpdateSettingsTradeBudgetDto } from './dto/update-settings-trade-budget.dto';
import { SettingsEntity } from './settings.entity';

import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('/info')
  getSettingsInfo(): Promise<SettingsEntity> {
    return this.settingsService.getSettings();
  }

  @Patch('/trade-budget')
  updateSettingsTradeBudget(
    @Body(ValidationPipe)
    updateSettingsTradeBudget: UpdateSettingsTradeBudgetDto,
  ): Promise<void> {
    return this.settingsService.updateSettingsTradeBudget(
      updateSettingsTradeBudget,
    );
  }
}
