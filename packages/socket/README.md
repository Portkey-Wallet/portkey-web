# `@portkey-v1/socket`

![ES Version](https://img.shields.io/badge/ES-2020-yellow)
![Node Version](https://img.shields.io/badge/node-14.x-green)
[![NPM Package Version][npm-image-version]][npm-url]


It is already possible to follow [the standard abp tutorial](https://docs.abp.io/en/abp/latest/SignalR-Integration) to add [SignalR](https://docs.abp.io/en/abp/latest/SignalR-Integration) to your application. However, Portkey provides SignalR integration packages those simplify the integration and usage.


## Installation

### Using NPM

```bash
npm install @portkey-v1/socket
```

### Using Yarn

```bash
yarn add @portkey-v1/socket
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
import { DIDSignalr } from '@portkey-v1/socket'

// new signalr instance
const didSignalr = new DIDSignalr();
// open link
didSignalr.doOpen({ url: 'your did signalr url', clientId: 'your clientId' });
// Scan code feedback
didSignalr.onScanLogin(({ body }) => console.log(body));
```

[npm-image-version]: https://img.shields.io/npm/v/@portkey-v1/socket
[npm-url]: https://npmjs.org/package/@portkey-v1/socket