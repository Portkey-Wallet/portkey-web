<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "./logo.png"/>
  </a>
</p>

<h1 align="center">portkey-web</h1>

[![CI](https://github.com/Portkey-Wallet/portkey-web/actions/workflows/CI.yml/badge.svg)](https://github.com/Portkey-Wallet/portkey-web/actions/workflows/CI.yml)

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-98.91%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-97.56%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-95.32%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-98.94%25-brightgreen.svg?style=flat) |


## Packages

| Package                                                   | Version                                                                                                                                       | Size                                                                                                                                                             | Link                                                                      |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [`@portkey-v1/did`](packages/did)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/did)](https://www.npmjs.com/package/@portkey-v1/did)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/did)](https://bundlephobia.com/package/@portkey-v1/did)                     |                                                                           |
| [`@portkey-v1/accounts`](packages/accounts)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/accounts)](https://www.npmjs.com/package/@portkey-v1/accounts)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/accounts)](https://bundlephobia.com/package/@portkey-v1/accounts)                       |                                                                           |
| [`@portkey-v1/contracts`](packages/contracts)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/contracts)](https://www.npmjs.com/package/@portkey-v1/contracts)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/contracts)](https://bundlephobia.com/package/@portkey-v1/contracts) |
| [`@portkey-v1/graphql`](packages/graphql)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/graphql)](https://www.npmjs.com/package/@portkey-v1/graphql)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/graphql)](https://bundlephobia.com/package/@portkey-v1/graphql)                     |                                                                           |
| [`@portkey-v1/request`](packages/request)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/request)](https://www.npmjs.com/package/@portkey-v1/request)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/request)](https://bundlephobia.com/package/@portkey-v1/request)                                    |
| [`@portkey-v1/services`](packages/services)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/services)](https://www.npmjs.com/package/@portkey-v1/services)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/services)](https://bundlephobia.com/package/@portkey-v1/services)                                          |
| [`@portkey-v1/types`](packages/types)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/types)](https://www.npmjs.com/package/@portkey-v1/types)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/types)](https://bundlephobia.com/package/@portkey-v1/types)                 |                                                                           |
| [`@portkey-v1/utils`](packages/utils)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/utils)](https://www.npmjs.com/package/@portkey-v1/utils)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/utils)](https://bundlephobia.com/package/@portkey-v1/utils)                         |                                                                           |
| [`@portkey-v1/validator`](packages/validator)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/validator)](https://www.npmjs.com/package/@portkey-v1/validator)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/validator)](https://bundlephobia.com/package/@portkey-v1/validator)                               |                                                                           |
| [`@portkey-v1/socket`](packages/socket)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/utils)](https://www.npmjs.com/package/@portkey-v1/socket)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/socket)](https://bundlephobia.com/package/@portkey-v1/socket)|
| **UI Packages**                                            |                                                                                                                                               |                                                                                                                                                                  |                                                                           |
| [`@portkey-v1/did-ui-react`](packages/did-ui-react)                     | [![npm](https://img.shields.io/npm/v/@portkey-v1/did-ui-react)](https://www.npmjs.com/package/@portkey-v1/did-ui-react)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey-v1/did-ui-react)](https://bundlephobia.com/package/@portkey-v1/did-ui-react) 

## Get start

for users

## Program start

```bash
yarn

# build packages
yarn build

# try to run test
yarn test
```

## How to program in the portkey sdk

Write you interface and test case at first.

For example, if we want to run did.init();

```typescript
// first step
// in interface files
export interface IDid {
  init(): boolean;
}
// second step
// intest files list did.test.ts
describe('did', () => {
  test('did init', () => {
    expect(did.init()).resolves.toBeTrue(); // true
  });
});

// third step
// implement the interface
class Did implements IDid {
  init() {
    return true;
  }
}
```

```bash
# run your test
npx jest ./packages/did/test/did.test.ts
# if passed, success
```

Loop the steps to get an awesome program.

## IoC

```typescript
@injectable()
class Did implements IDid {
  init() {
    return true;
  }
}
```

Node: jest will help us to write a better program with ioc.