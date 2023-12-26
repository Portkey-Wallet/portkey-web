'use client';

ConfigProvider.setGlobalConfig({
  // test3
  serviceUrl: 'http://192.168.66.203:5001',
});
import {
  handleErrorMessage,
  managerApprove,
  checkWalletSecurity,
  ConfigProvider,
  NFTCheckout,
  did,
  PortkeyProvider,
  PortkeyStyleProvider,
  singleMessage,
  PortkeyAssetProvider,
} from '@portkey-v1/did-ui-react';
import { evokePortkey } from '@portkey-v1/onboarding';
import { message, Button } from 'antd';
import { useEffect, useState } from 'react';

ConfigProvider.setGlobalConfig({
  requestDefaults: {
    timeout: 30000,
  },
});

export default function AppleAuth() {
  const [status, setStatus] = useState<string>();
  return (
    <div>
      <div>--------</div>
      <Button
        onClick={() => {
          evokePortkey.app({
            action: 'login',
            custom: {},
            onStatusChange: status => {
              singleMessage.error(status);
              setStatus(status);
            },
          });
          singleMessage.warning('evokePortkeyApp');
        }}>
        evokePortkeyApp
      </Button>
      {status}
      <div>--------</div>
      <Button
        onClick={async () => {
          const result = await evokePortkey.extension();
          // singleMessage.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        extension
      </Button>
      <div>-----</div>
      <Button
        onClick={async () => {
          const result = await evokePortkey.thirdParty();
          // singleMessage.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        thirdParty
      </Button>
      <div>-----</div>
      <Button
        onClick={async () => {
          const VConsole = require('vconsole');
          new VConsole();
        }}>
        VConsole
      </Button>

      <div>-----</div>

      <Button
        onClick={async () => {
          try {
            await did.load('111111');
            const result = await managerApprove({
              originChainId: 'AELF',
              symbol: 'ELF',
              caHash: did.didWallet.caInfo['AELF'].caHash,
              amount: '999',
              targetChainId: 'AELF',
            });
            console.log(result, 'result===');
          } catch (error) {
            message.error(handleErrorMessage(error));
          }
        }}>
        managerApprove
      </Button>

      <div>-----</div>
      <PortkeyProvider sandboxId="" networkType="MAIN">
        <Button
          onClick={async () => {
            try {
              await did.load('111111');
              const result = await checkWalletSecurity({
                originChainId: 'AELF',
                targetChainId: 'tDVV',
                caHash: did.didWallet.caInfo['AELF'].caHash,
              });
              console.log(result, 'result===');
            } catch (error) {
              message.error(handleErrorMessage(error));
            }
          }}>
          checkWalletSecurity
        </Button>
      </PortkeyProvider>

      <div id="nft-checkout">-----</div>

      <PortkeyAssetProvider pin="111111" originChainId="AELF">
        <Button
          type="primary"
          onClick={async () => {
            try {
              const result = await NFTCheckout({
                orderId: '49300e1c-ecd0-2ca1-6468-a48995ada2a6',
                originChainId: 'AELF',

                appId: 't2D3213Nr78PMJ9g',
                achWebUrl: 'https://nft-sbx.alchemytech.cc',
                merchantName: 'Alchemy',
              });
              console.log(result, 'result=NFTCheckout');
            } catch (error) {
              console.log('NFTCheckout:', error);
            }
          }}>
          nft checkout
        </Button>
      </PortkeyAssetProvider>
    </div>
  );
}
