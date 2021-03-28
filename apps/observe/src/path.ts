export const Path = {
  BINANCE_TRADE: (firstPair: string, secondPair: string): string =>
    `https://www.binance.com/en/trade/${firstPair}_${secondPair}`,
  TOKEN_INFO:
    'https://etherscan.io/address/0x2fdbadf3c4d5a8666bc06645b8358ab803996e28',
};
