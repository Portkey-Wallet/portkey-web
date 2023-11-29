'use client';
import { PortkeyAssetProvider, NFTCheckout, ConfigProvider, singleMessage } from '@portkey/did-ui-react';
import { evokePortkey } from '@portkey/onboarding';
import { Button } from 'antd';
import { useState } from 'react';

ConfigProvider.setGlobalConfig({
  // test3
  serviceUrl: 'http://elf.nzcong.cn:11158',
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
