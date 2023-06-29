# `@portkey/socket`

![ES Version](https://img.shields.io/badge/ES-2020-yellow)
![Node Version](https://img.shields.io/badge/node-14.x-green)
[![NPM Package Version][npm-image-version]][npm-url]


## Installation

### Using NPM

```bash
npm install @portkey/socket
```

### Using Yarn

```bash
yarn add @portkey/socket
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
import { DIDSignalr } from '@portkey/socket'

// new signalr instance
const didSignalr = new DIDSignalr();
// open link
didSignalr.doOpen({ url: 'your did signalr url', clientId: 'your clientId' });
// Scan code feedback
didSignalr.onScanLogin(({ body }) => console.log(body));
```

[npm-image-version]: https://img.shields.io/npm/v/@portkey/socket
[npm-url]: https://npmjs.org/package/@portkey/socket