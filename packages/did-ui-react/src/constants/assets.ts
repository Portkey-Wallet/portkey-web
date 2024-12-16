import { ITokenSectionResponse } from '../components/types/assets';

export const ELF_SYMBOL = 'ELF';

export const DEFAULT_DECIMAL = 8;

export const NEW_CLIENT_DEFAULT_ELF_LIST: ITokenSectionResponse[] = [
  {
    balance: '0',
    balanceInUsd: '0.000000',
    price: 0,
    decimals: 8,
    imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/Coin-ELF.png',
    symbol: 'ELF',
    tokens: [
      {
        name: 'ELF',
        address: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
        balance: '0',
        balanceInUsd: '0.000000',
        chainId: 'AELF',
        decimals: 8,
        imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/Coin-ELF.png',
        symbol: 'ELF',
        tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
      },
    ],
  },
];

export const NFT_SMALL_SIZE = 144;

export const DEFAULT_TOKEN = {
  address: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
  decimals: '8',
  imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf_token_logo.png',
  name: 'AELF',
  symbol: 'ELF',
};

export const InitialTxFee = {
  ach: 0.39,
  crossChain: 0.35,
  max: 0.39,
};

export enum AssetStep {
  overview = 'overview',
  receive = 'receive',
  ramp = 'ramp',
  rampPreview = 'rampPreview',
  send = 'send',
  transactionDetail = 'transactionDetail',
  tokenDetail = 'tokenDetail',
  NFTDetail = 'NFTDetail',
  my = 'my',
  guardians = 'guardians',
  walletSecurity = 'walletSecurity',
  transactionLimits = 'transactionLimits',
  transferSettings = 'transferSettings',
  transferSettingsEdit = 'transferSettingsEdit',
  deleteAccount = 'deleteAccount',
  tokenAllowance = 'tokenAllowance',
  tokenAllowanceDetail = 'tokenAllowanceDetail',
  setSecondaryMailbox = 'setSecondaryMailbox',
  collectionDetail = 'collectionDetail',
}
