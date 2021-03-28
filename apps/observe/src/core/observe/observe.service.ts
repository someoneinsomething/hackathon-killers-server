import { Service } from '../../type';

export class ObserveService extends Service {
  calculateTokenDifference({ token, weth, amount, revert = false }): any {
    const commission = 0.997;
    const pool = token * weth;

    if (revert) {
      const newValue = pool / (token + amount * commission);

      const calculatedAmount = weth - newValue;

      return { calculatedAmount, pool, newValue };
    }

    const newValue = pool / (weth + amount * commission);

    const calculatedAmount = token - newValue;

    return { calculatedAmount, pool, newValue };
  }
}
