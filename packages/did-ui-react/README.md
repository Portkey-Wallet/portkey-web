
<p align="center">
  <a href="https://portkeydocs.readthedocs.io/en/pre-release/PortkeyDIDUISDK/index.html">
    <img width="200" src= "https://raw.githubusercontent.com/Portkey-Wallet/portkey-web/master/logo.png"/>
  </a>
</p>

<h1 align="center">@portkey/did-ui-react</h1>

<div align="center">
With Portkey DID SDK, developers can swiftly embed Web3 DID wallet functions while
keeping their original UI.
</div>

<h2>✨ Features </h2>

- 📦 A set of high-quality React components out of the box.
- 🛡 Written in TypeScript with predictable static types.

<h2>📦 Installation</h2>

```bash
npm install "@portkey/did-ui-react
```

```bash
yarn add "@portkey/did-ui-react
```

## 🔨 Usage

```tsx
import { SignIn, PortkeyConfigProvider, DIDWalletInfo, SignInInterface } from '@portkey/did-ui-react';
import { useRef, useCallback } from 'react';

const App = () => {
  const ref = useRef<SignInInterface>();

  const onFinish = useCallback((didWallet: DIDWalletInfo) => {
    console.log('didWallet:', didWallet);
  }, []);

  return (
    <PortkeyConfigProvider>
      <button
        onClick={() => {
          ref.current?.setOpen(true);
        }}>
        Sign In
      </button>
      <SignIn ref={ref} onFinish={onFinish} />
    </PortkeyConfigProvider>
  );
};

```

### Customize request

If you use it on applications that don't require cross-domain, like Chrome extensions,
please configure your provider address using ```ConfigProvider.setGlobalConfig```:

```tsx

import { ConfigProvider } from '@portkey/did-ui-react';

ConfigProvider.setGlobalConfig({
  requestDefaults: {
    baseURL: 'http://localhost:3000',
  },
  graphQLUrl: 'http://localhost:3000/graphQL',
});

```

### Customize storage

If you need to customize persistent storage, the default storage is ```localStorage```:

```tsx

export interface IStorageSuite {
  getItem: (key: string) => Promise<any>;
  setItem: (key: string, value: string) => Promise<any>;
  removeItem: (key: string) => Promise<any>;
}

ConfigProvider.setGlobalConfig({
  storageMethod: new IStorageSuite()
})

```

### Example

[Bingogame](https://bingogame-pro.portkey.finance/)

[Bingogame Github](https://github.com/Portkey-Wallet/portkey-bingo-game)

You can also use the ```next-example``` in the current project

```bash
  yarn next-example dev
```

### TypeScript

`@portkey/did-ui-react` is written in TypeScript with complete definitions.

## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

You can submit any ideas as pull requests or as GitHub issues.
let's build a better antd together.
