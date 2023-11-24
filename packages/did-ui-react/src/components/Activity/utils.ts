export function getCurrentActivityMapKey(chainId: string | undefined, symbol: string | undefined) {
  if (!chainId && !symbol) {
    return 'TOTAL';
  } else {
    return `${chainId}_${symbol}`;
  }
}
