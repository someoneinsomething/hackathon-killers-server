import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateSettingsTradeBudgetDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100000)
  tradeBudget: number;
}
