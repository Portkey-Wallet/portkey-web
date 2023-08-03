import { ConfigProvider, Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import React from 'react';
import { Store } from '../../utils';
const myStore = new Store();

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,

  requestDefaults: {
    timeout: 30000,
  },
});
// {
//   "caInfo": {
//       "caAddress": "RfjvUbmpfaopgUPuUKgcvBZV35MkmrDmrWiXyYoQqqfovagYx",
//       "caHash": "bd8f9aee71f7a582ee15ca7b6d76a3a924364a60a11ee48fb49b997989e0dbcf"
//   },
//   "accountInfo": {
//       "managerUniqueId": "bfc3b9b6-7972-44b0-a25f-a815e720f3ad",
//       "guardianIdentifier": "105383420233267798964",
//       "accountType": "Google",
//       "type": "recovery"
//   },
//   "chainId": "AELF",
//   "pin": "111111",
//   "walletInfo": {
//       "mnemonic": "kingdom cheese example sauce retreat arrow purity toddler anxiety snack dwarf axis",
//       "BIP44Path": "m/44'/1616'/0'/0/1",
//       "childWallet": {
//           "xpriv": "xprvA3kjajvmUAsRZsV7fy21XiWfyr4gV22WJFQX3jKjDGfQ7kK2dTwZqPkmWpm1spJd2hCj4tQrRGVdQn8krVQ46yNTK4dy3PaLrWUe6591SvL",
//           "xpub": "xpub6Gk5zFTfJYRinMZamzZ1trTQXsuAtUkMfUL7r7jLmcCNzYeBB1FpPC5FN62hSYtxUaBERQ71Y2u9JJARfJ9q1RckjckuyY41trcKwD6TxyZ"
//       },
//       "privateKey": "0d793e7e158c80425441fcc668522b899695c5edf243ad790d428a131f112c1b",
//       "address": "xhhoeCJ6yMXpELxxd26G2FTGVhRf5rr1Gzn64qeNbcXyfep77"
//   }
// }

export default function Assets() {
  return (
    <PortkeyAssetProvider
      pin="111111"
      // managerPrivateKey="0d793e7e158c80425441fcc668522b899695c5edf243ad790d428a131f112c1b"
      // caHash="bd8f9aee71f7a582ee15ca7b6d76a3a924364a60a11ee48fb49b997989e0dbcf"
      originChainId="AELF">
      <Asset />
    </PortkeyAssetProvider>
  );
}
