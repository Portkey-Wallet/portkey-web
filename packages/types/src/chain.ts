export type ChainId = 'AELF' | 'tDVV' | 'tDVW';
export type ChainType = 'ethereum' | 'aelf';
export const ChainIdMap: { [x in ChainId]: string } = {
  AELF: '9992731',
  tDVV: '1866392',
  tDVW: '1931928',
};

export type MultiChainInfo = {
  [x in ChainId]: {
    chainUrl: string;
    contractAddress: string;
  };
};

export type MultiTransactionParamInfo = {
  [x in ChainId]: {
    symbol: string;
    amount: string;
    to: string;
  };
};
