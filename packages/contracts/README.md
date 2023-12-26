# `@portkey-v1/contracts`

![ES Version](https://img.shields.io/badge/ES-2020-yellow)
![Node Version](https://img.shields.io/badge/node-14.x-green)
[![NPM Package Version][npm-image-version]][npm-url]


## Installation

### Using NPM

```bash
npm install @portkey-v1/contracts
```

### Using Yarn

```bash
yarn add @portkey-v1/contracts
```

## Prerequisites

- :gear: [NodeJS](https://nodejs.org/) (LTS/Fermium)
- :toolbox: [Yarn](https://yarnpkg.com/)/[Lerna](https://lerna.js.org/)

## Package.json Scripts

| Script   | Description                                        |
| -------- | -------------------------------------------------- |
| clean    | Uses `rm` to remove `dist/`                        |
| build    | Uses `tsc` to build package and dependent packages |
| lint     | Uses `eslint` to lint package                      |
| lint:fix | Uses `eslint` to check and fix any warnings        |
| format   | Uses `prettier` to format the code                 |

# Basic Usage

```typescript
import { getContractBasic } from '@portkey-v1/contracts'

// use ca contract 
const contract = await getContractBasic({
  chainType: 'aelf',
  account: 'your account',
  contractAddress: 'contractAddress',
  caContractAddress: 'caContractAddress',
  callType: 'ca',
  caHash: 'caHash',
  rpcUrl: 'rpcUrl',
});

// use base contract 
const contract = await getContractBasic({
  account: 'your account',
  contractAddress: 'contractAddress',
  chainType: 'aelf',
  rpcUrl: 'rpcUrl',
})

// use portkey provider
import detectProvider from '@portkey/detect-provider';
// detect provider
const provider = await detectProvider();
// get chain provider
const chainProvider = await provider.getChain('AELF');

const contract = await getContractBasic({
  chainProvider,
  contractAddress: 'contractAddress',
});

// call view
contract.callViewMethod('your method', paramsOption);
// call send
contract.callSendMethod('your method', 'your address', paramsOption);
```
### standard types

[contract types](../types/src/contract.ts)



[npm-image-version]: https://img.shields.io/npm/v/@portkey-v1/contracts
[npm-url]: https://npmjs.org/package/@portkey-v1/contracts