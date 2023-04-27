<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "./logo.png"/>
  </a>
</p>

<h1 align="center">portkey-web</h1>

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-79.24%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-57.19%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-75.8%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-85.74%25-yellow.svg?style=flat) |

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