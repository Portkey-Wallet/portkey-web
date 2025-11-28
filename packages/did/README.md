<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDSDK/index.html">
    <img width="200" src= "https://raw.githubusercontent.com/Portkey-Wallet/portkey-web/master/logo.png"/>
  </a>
</p>

<h1 align="center">@portkey/did</h1>

![ES Version](https://img.shields.io/badge/ES-2020-yellow)
![Node Version](https://img.shields.io/badge/node-14.x-green)
[![NPM Package Version][npm-image-version]][npm-url]

- [Prerequisites](#prerequisites)
- [Package.json Scripts](#packagejson-scripts)
- [Getting Started](#getting-started)
  - [Installation](#installation)
    - [Using NPM](#using-npm)
    - [Using Yarn](#using-yarn)
- [`@portkey/did` API Reference](#portkeydid-api-reference)
  - [did.setConfig](#didsetconfig)
  - [did.login](#didlogin)
    - [type: loginAccount](#type-loginaccount)
    - [type: scan](#type-scan)
    - [getLoginStatus](#getloginstatus)
  - [logout](#logout)
  - [register](#register)
    - [getRegisterStatus](#getregisterstatus)
  - [getHolderInfo](#getholderinfo)
  - [getVerifierServers](#getverifierservers)
  - [services](#services)
    - [services.getVerificationCode](#servicesgetverificationcode)
    - [services.verifyVerificationCode](#servicesverifyverificationcode)
    - [services.verifyGoogleToken](#servicesverifygoogletoken)
    - [services.verifyAppleToken](#servicesverifyappletoken)
    - [services.sendAppleUserExtraInfo](#servicessendappleuserextrainfo)

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

## Getting Started

The `@portkey/did` library is a collection of modules that contain functionality for the did ecosystem.

- `@portkey/accounts` is for the portkey account.
- `@portkey/utils` is for the portkey utils.
- `@portkey/contracts` is for the portkey contracts.
- `@portkey/graphql` is for the portkey graphql.
- `@portkey/request` is for the portkey request.
- `@portkey/types` is for the portkey types.
- `@portkey/utils` is for the portkey utils.
- `@portkey/validator` is for the portkey validator.

### Installation

#### Using NPM

```bash
npm install @portkey/did
```

#### Using Yarn

```bash
yarn add @portkey/did
```

After that you need configure did server node、graphQL node、storage suite.

```ts
class Store implements IStorageSuite {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return localStorage.removeItem(key);
  }
}
did.setConfig({
  requestDefaults: {
    baseURL: 'your did server node',
    timeout: 'timeout', // optional default 8000ms
  },
  graphQLUrl: 'your graphQL node',
  storageMethod: new Store(),
});
```

That’s it! now you can use the `did` object.

## `@portkey/did` API Reference

### did.setConfig

Where you configure did server node, graphQL node, storage suite.

```ts
did.setConfig({
  requestDefaults: {
    baseURL: 'you did server node',
    timeout: 'timeout', // optional default 8000ms
  },
  graphQLUrl: 'your graphQL node',
  storageMethod: 'your storage suite',
});
```

### did.login

#### type: loginAccount

Email or mobile phone number or Google or Apple login.

```ts
did.login(type: 'loginAccount', params: AccountLoginParams): Promise<LoginResult>;
```

Example

```ts
did.login('loginAccount', {
  chainId: 'chainId',
  loginGuardianIdentifier: 'loginGuardianIdentifier',
  guardiansApproved: [
    {
      type: 'Email',
      identifier: 'identifier',
      verifierId: 'verifierId',
      verificationDoc: 'verificationDoc',
      signature: 'signature',
    },
  ],
  extraData: 'extraData',
  context: {
    requestId: 'requestId',
    clientId: 'clientId',
  },
});
```

#### type: scan

Logged in management to add management.

```ts
login(type: 'scan', params: ScanLoginParams): Promise<true>;
```

Example

```ts
did.login('scan',{
  chainId: 'chainId',
  caHash: 'caHash',
  managerInfo: {
    address: 'address',
    extraData: 'extraData'
  };
})
```

#### getLoginStatus

```ts
getLoginStatus(params: { chainId: ChainId; sessionId: string }): Promise<RecoverStatusResult>;
```

Example

```ts
did.getLoginStatus({
  chainId: 'chainId',
  sessionId: 'sessionId',
});
```

### logout

```ts
logout(params: EditManagerParams): Promise<boolean>;
```

Example

```ts
did.logout({ chainId: 'chainId' });
```

### register

```ts
register(params: Omit<RegisterParams, 'manager'>): Promise<RegisterResult>;
```

Example

```ts
did.register({
  type: 'Email',
  loginGuardianIdentifier: 'loginGuardianIdentifier',
  extraData: 'extraData',
  chainId: 'chainId',
  verifierId: 'verifierId',
  verificationDoc: 'verificationDoc',
  signature: 'signature',
  context: {
    requestId: 'requestId',
    clientId: 'clientId',
  },
});
```

#### getRegisterStatus

```ts
getRegisterStatus(params: { chainId: ChainId; sessionId: string }): Promise<RegisterStatusResult>;
```

Example

```ts
did.getRegisterStatus({
  chainId: 'chainId',
  sessionId: 'sessionId',
});
```

### getHolderInfo

getHolderInfo by graphQL.

```ts
getHolderInfo(params: Pick<GetHolderInfoParams, 'manager' | 'chainId'>): Promise<GetCAHolderByManagerResult>;
```

Example

```ts
did.getHolderInfo({
  manager: 'manager', // optional
  chainId: 'chainId',
});
```

getHolderInfo by server.

```ts
getHolderInfo(params: Omit<GetHolderInfoParams, 'manager'>): Promise<IHolderInfo>;
```

Example

```ts
did.getHolderInfo({
  caHash: 'caHash', // loginGuardianIdentifier and caHash choose one
  loginGuardianIdentifier: 'loginGuardianIdentifier', // loginGuardianIdentifier and caHash choose one
  chainId: 'chainId',
});
```

### getVerifierServers

Get the VerifierServer information of the corresponding chain.

```ts
getVerifierServers(chainId: ChainId): Promise<VerifierItem[]>;
```

Example

```ts
did.getVerifierServers({
  chainId: 'chainId',
});
```

### check manager is exist

Check whether the manager has management permissions for the account.

```ts
checkManagerIsExist(params:{chainId: ChainId, caHash:string, manager:string}): Promise<boolean>;
```

Example

```ts
did.checkManagerIsExist({
  chainId: 'chainId',
  caHash: 'caHash',
  manager: 'manager'
});
```

### services

#### services.getVerificationCode

send verification code.

```ts
getVerificationCode(params: SendVerificationCodeRequestParams): Promise<SendVerificationCodeResult>;
```

Example

```ts
did.services.getVerificationCode({
  params: {
    chainId: 'chainId',
    guardianIdentifier: 'guardianIdentifier',
    type: 'Email',
    verifierId: 'verifierId',
    operationType: 'operationType',
  },
  headers: {
    reCaptchaToken: 'reCaptchaToken',
  },
});
```

[operationType types](../services/src/types/communityRecovery.ts)

#### services.verifyVerificationCode

verify verification code.

```ts
verifyVerificationCode(params: VerifyVerificationCodeParams): Promise<VerifyVerificationCodeResult>;
```

Example

```ts
did.services.verifyVerificationCode({
  verifierSessionId: 'verifierSessionId',
  chainId: 'chainId',
  guardianIdentifier: 'guardianIdentifier',
  verifierId: 'verifierId',
  verificationCode: 'verificationCode',
  operationType: 'operationType',
});
```

#### services.verifyGoogleToken

verify Google token.

```ts
verifyGoogleToken(params: VerifierSocialTokenParams): Promise<VerifyVerificationCodeResult>;
```

Example

```ts
did.services.verifyGoogleToken({
  chainId: 'chainId',
  accessToken: 'accessToken',
  verifierId: 'verifierId',
  operationType: 'operationType',
});
```

#### services.verifyAppleToken

verify Apple token.

```ts
verifyAppleToken(params: VerifyAppleTokenParams): Promise<VerifyVerificationCodeResult>;
```

Example

```ts
did.services.verifyAppleToken({
  chainId: 'chainId',
  verifierId: 'verifierId',
  identityToken: 'identityToken',
  operationType: 'operationType',
});
```

#### services.sendAppleUserExtraInfo

send Apple user extra info.

```ts
sendAppleUserExtraInfo(params: SendAppleUserExtraInfoParams): Promise<SendAppleUserExtraInfoResult>;
```

Example

```ts
did.services.sendAppleUserExtraInfo({
  identityToken: 'identityToken',
  userInfo: {
    name: {
      firstName: 'firstName',
      lastName: 'lastName',
    },
    email: 'email',
  },
});
```

[npm-image-version]: https://img.shields.io/npm/v/@portkey/did
[npm-url]: https://npmjs.org/package/@portkey/did
