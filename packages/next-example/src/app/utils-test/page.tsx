'use client';
import {
  ConfigProvider,
  PortkeyAssetProvider,
  did,
  getChain,
  handleErrorMessage,
  managerApprove,
  NFTCheckout,
  ACHCheckout,
} from '@portkey/did-ui-react';
import { Button } from 'antd';
import { evokePortkey } from '@portkey/onboarding';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { getContractBasic } from '@portkey/contracts';
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
        type="primary"
        onClick={() => {
          evokePortkey.app({
            action: 'login',
            custom: {},
            onStatusChange: status => {
              message.error(status);
              setStatus(status);
            },
          });
          message.warning('evokePortkeyApp');
        }}>
        evokePortkeyApp
      </Button>
      {status}
      <div>--------</div>
      <Button
        type="primary"
        onClick={async () => {
          const result = await evokePortkey.extension();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        extension
      </Button>
      <div>-----</div>
      <Button
        type="primary"
        onClick={async () => {
          const result = await evokePortkey.thirdParty();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        thirdParty
      </Button>
      <div>-----</div>

      <Button
        type="primary"
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
