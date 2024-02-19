<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "./logo.png"/>
  </a>
</p>

<h1 align="center">portkey-web</h1>

[![CI](https://github.com/Portkey-Wallet/portkey-web/actions/workflows/CI.yml/badge.svg)](https://github.com/Portkey-Wallet/portkey-web/actions/workflows/CI.yml)

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-98.16%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-97.08%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-93.25%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-98.39%25-brightgreen.svg?style=flat) |


## Packages

| Package                                                   | Version                                                                                                                                       | Size                                                                                                                                                             | Link                                                                      |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [`@portkey/did`](packages/did)                     | [![npm](https://img.shields.io/npm/v/@portkey/did)](https://www.npmjs.com/package/@portkey/did)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/did)](https://bundlephobia.com/package/@portkey/did)                     |                                                                           |
| [`@portkey/accounts`](packages/accounts)                     | [![npm](https://img.shields.io/npm/v/@portkey/accounts)](https://www.npmjs.com/package/@portkey/accounts)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/accounts)](https://bundlephobia.com/package/@portkey/accounts)                       |                                                                           |
| [`@portkey/contracts`](packages/contracts)                     | [![npm](https://img.shields.io/npm/v/@portkey/contracts)](https://www.npmjs.com/package/@portkey/contracts)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/contracts)](https://bundlephobia.com/package/@portkey/contracts) |
| [`@portkey/graphql`](packages/graphql)                     | [![npm](https://img.shields.io/npm/v/@portkey/graphql)](https://www.npmjs.com/package/@portkey/graphql)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/graphql)](https://bundlephobia.com/package/@portkey/graphql)                     |                                                                           |
| [`@portkey/request`](packages/request)                     | [![npm](https://img.shields.io/npm/v/@portkey/request)](https://www.npmjs.com/package/@portkey/request)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/request)](https://bundlephobia.com/package/@portkey/request)                                    |
| [`@portkey/services`](packages/services)                     | [![npm](https://img.shields.io/npm/v/@portkey/services)](https://www.npmjs.com/package/@portkey/services)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/services)](https://bundlephobia.com/package/@portkey/services)                                          |
| [`@portkey/types`](packages/types)                     | [![npm](https://img.shields.io/npm/v/@portkey/types)](https://www.npmjs.com/package/@portkey/types)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/types)](https://bundlephobia.com/package/@portkey/types)                 |                                                                           |
| [`@portkey/utils`](packages/utils)                     | [![npm](https://img.shields.io/npm/v/@portkey/utils)](https://www.npmjs.com/package/@portkey/utils)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/utils)](https://bundlephobia.com/package/@portkey/utils)                         |                                                                           |
| [`@portkey/validator`](packages/validator)                     | [![npm](https://img.shields.io/npm/v/@portkey/validator)](https://www.npmjs.com/package/@portkey/validator)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/validator)](https://bundlephobia.com/package/@portkey/validator)                               |                                                                           |
| [`@portkey/socket`](packages/socket)                     | [![npm](https://img.shields.io/npm/v/@portkey/utils)](https://www.npmjs.com/package/@portkey/socket)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/socket)](https://bundlephobia.com/package/@portkey/socket)|
| **UI Packages**                                            |                                                                                                                                               |                                                                                                                                                                  |                                                                           |
| [`@portkey/did-ui-react`](packages/did-ui-react)                     | [![npm](https://img.shields.io/npm/v/@portkey/did-ui-react)](https://www.npmjs.com/package/@portkey/did-ui-react)                     | [![minzip](https://img.shields.io/bundlephobia/minzip/@portkey/did-ui-react)](https://bundlephobia.com/package/@portkey/did-ui-react) 

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