export const rampInfoResponse = {
  thirdPart: {
    Alchemy: {
      name: 'AlchemyPay',
      appId: 'alchemy-pay-app-id',
      baseUrl: 'https://ramptest.alchemypay.org',
      callbackUrl: 'https://alchemypay-callback.com',
      logo: 'https://alchemypay-logo.png',
      coverage: {
        buy: true,
        sell: true,
      },
      paymentTags: [
        'https://xxx.s3.ap-northeast-1.amazonaws.com/GooglePay.png',
        'https://xxx.s3.ap-northeast-1.amazonaws.com/ApplePay.png',
      ],
    },
    Transak: {
      name: 'Transak',
      appId: 'transak-app-id',
      baseUrl: 'https://global-stg.transak.com',
      callbackUrl: 'https://transak-callback.com',
      logo: 'https://transak-logo.png',
      coverage: {
        buy: true,
        sell: false,
      },
      paymentTags: [
        'https://xxx.s3.ap-northeast-1.amazonaws.com/GooglePay.png',
        'https://xxx.s3.ap-northeast-1.amazonaws.com/ApplePay.png',
      ],
    },
  },
};

export const rampCryptoBuyResponse = {
  cryptoList: [
    {
      symbol: 'ELF',
      icon: 'https://explorer-test.aelf.io/favicon.test.ico',
      decimals: '8',
      network: 'AELF',
      chainId: 'AELF',
      address: '',
    },
    {
      symbol: 'USDT',
      icon: 'https://xxx.s3.ap-northeast-1.amazonaws.com/USDT.jpg',
      decimals: '6',
      network: 'AELF',
      chainId: 'AELF',
      address: '',
    },
  ],
  defaultCrypto: {
    symbol: 'ELF',
    amount: '200',
    network: 'AELF',
    chainId: 'AELF',
    icon: 'https://explorer-test.aelf.io/favicon.test.ico',
  },
};

export const rampCryptoSellResponse = {
  cryptoList: [
    {
      symbol: 'ELF',
      icon: 'https://explorer-test.aelf.io/favicon.test.ico',
      decimals: '8',
      network: 'AELF',
      chainId: 'AELF',
      address: '',
    },
  ],
  defaultCrypto: {
    symbol: 'ELF',
    amount: '400',
    network: 'AELF',
    chainId: 'AELF',
    icon: 'https://explorer-test.aelf.io/favicon.test.ico',
  },
};

export const rampFiatBuyResponse = {
  fiatList: [
    {
      country: 'US',
      symbol: 'USD',
      countryName: 'United States',
      icon: 'https://xxx.alchemypay/flag/US.png',
    },
    {
      country: 'GB',
      symbol: 'GBP',
      countryName: 'United Kingdom',
      icon: 'https://xxx.alchemypay/flag/GB.png',
    },
  ],
  defaultFiat: {
    symbol: 'USD',
    amount: '200',
    country: 'US',
    countryName: 'United States',
    icon: 'https://xxx.alchemypay/flag/US.png',
  },
};

export const rampFiatSellResponse = {
  fiatList: [
    {
      country: 'US',
      symbol: 'USD',
      countryName: 'United States',
      icon: 'https://xxx.alchemypay/flag/US.png',
    },
    {
      country: 'GB',
      symbol: 'GBP',
      countryName: 'United Kingdom',
      icon: 'https://xxx.alchemypay/flag/GB.png',
    },
  ],
  defaultFiat: {
    symbol: 'GBP',
    amount: '300',
    country: 'GB',
    countryName: 'United Kingdom',
    icon: 'https://xxx.alchemypay/flag/GB.png',
  },
};

export const rampLimitBuyResponse = {
  crypto: null,
  fiat: {
    symbol: 'USD',
    minLimit: '5',
    maxLimit: '3000',
  },
};

export const rampLimitSellResponse = {
  crypto: {
    symbol: 'ELF',
    minLimit: '34.166796',
    maxLimit: '7002.640162',
  },
  fiat: null,
};

export const rampPriceBuyResponse = {
  fiatAmount: '400',
  cryptoAmount: '591.6575',
  thirdPart: 'Alchemy',
  exchange: '0.64',
  feeInfo: {
    rampFee: {
      type: 'Fiat',
      amount: '16.36',
      symbol: 'USD',
      symbolPriceInUsdt: null,
    },
    networkFee: {
      type: 'Fiat',
      amount: '0.64',
      symbol: 'USD',
      symbolPriceInUsdt: null,
    },
  },
};

export const rampPriceSellResponse = {
  fiatAmount: '126.83400000000000',
  cryptoAmount: '200',
  thirdPart: 'Alchemy',
  exchange: '0.64400000000000',
  feeInfo: {
    rampFee: {
      type: 'Fiat',
      amount: '1.97',
      symbol: 'USD',
      symbolPriceInUsdt: null,
    },
    networkFee: {
      type: 'Fiat',
      amount: '0',
      symbol: 'USD',
      symbolPriceInUsdt: null,
    },
  },
};

export const rampDetailBuyResponse = {
  providersList: [
    {
      thirdPart: 'Alchemy',
      cryptoAmount: '591.6575',
      providerNetwork: 'ELF',
      providerSymbol: 'ELF',
      fiatAmount: null,
      exchange: '0.64',
      feeInfo: {
        rampFee: {
          type: 'Fiat',
          amount: '16.36',
          symbol: 'USD',
          symbolPriceInUsdt: null,
        },
        networkFee: {
          type: 'Fiat',
          amount: '0.64',
          symbol: 'USD',
          symbolPriceInUsdt: null,
        },
      },
    },
    {
      thirdPart: 'Transak',
      cryptoAmount: '589.24',
      providerNetwork: 'aelf',
      providerSymbol: 'ELF',
      fiatAmount: null,
      exchange: '0.650059',
      feeInfo: {
        rampFee: {
          type: 'Fiat',
          amount: '16.96',
          symbol: 'USD',
          symbolPriceInUsdt: null,
        },
        networkFee: {
          type: 'Fiat',
          amount: '0',
          symbol: 'USD',
          symbolPriceInUsdt: null,
        },
      },
    },
  ],
};

export const rampDetailSellResponse = {
  providersList: [
    {
      thirdPart: 'Alchemy',
      cryptoAmount: '591.6575',
      providerNetwork: 'ELF',
      providerSymbol: 'ELF',
      fiatAmount: null,
      exchange: '0.64',
      feeInfo: {
        rampFee: {
          type: 'Fiat',
          amount: '16.36',
          symbol: 'USD',
          symbolPriceInUsdt: null,
        },
        networkFee: {
          type: 'Fiat',
          amount: '0.64',
          symbol: 'USD',
          symbolPriceInUsdt: null,
        },
      },
    },
  ],
};
