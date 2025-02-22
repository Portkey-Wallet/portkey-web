export const formatApproveSymbolShow = (symbol: string) => {
  if (!symbol.includes('-')) return symbol;

  const firstStr = symbol.split('-')[0];
  const lastStr = symbol.split('-').splice(-1)[0];
  if (lastStr === '*') return firstStr;

  return symbol;
};
