export interface ITokenInfoType {
  balance: string;
  decimals: string;
  balanceInUsd: string;
  tokenContractAddress: string;
  imageUrl: string;
}

export interface IBaseNFTType {
  imageUrl: string;
  alias: string;
  nftId: string;
}

export interface INftInfoType {
  imageUrl: string;
  alias: string;
  tokenId: string;
  collectionName: string;
  tokenContractAddress: string;
  balance: string;
}
