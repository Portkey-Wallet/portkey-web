import { getContractBasic } from '@portkey/contracts';
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
import { evokePortkey } from '@portkey/onboarding';
import { aelf } from '@portkey/utils';
import { message } from 'antd';
import { useEffect, useState } from 'react';
ConfigProvider.setGlobalConfig({
  // test3
  serviceUrl: 'http://192.168.66.203:5001',
});

export default function AppleAuth() {
  const [status, setStatus] = useState<string>();
  return (
    <div>
      <div>--------</div>
      <button
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
      </button>
      {status}
      <div>--------</div>
      <button
        onClick={async () => {
          const result = await evokePortkey.extension();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        extension
      </button>
      <div>-----</div>
      <button
        onClick={async () => {
          const result = await evokePortkey.thirdParty();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        thirdParty
      </button>
      <div>-----</div>

      <button
        onClick={async () => {
          const VConsole = require('vconsole');
          new VConsole();
        }}>
        VConsole
      </button>

      <div>-----</div>

      <div id="nft-checkout">-----</div>

      {/* <PortkeyAssetProvider pin="111111" originChainId="AELF"> */}
      <button
        onClick={async () => {
          try {
            const result = await NFTCheckout({
              orderId: 'f637021e-5420-657a-dab6-4bb95b1d0422',
              appId: '0FdW9QJP7U96H01p',
              rampWebUrl: 'https://nft-sbx.alchemytech.cc',
              originChainId: 'AELF',
              merchantName: 'Alchemy',
            });
          } catch (error) {
            console.log('NFTCheckout:', error);
          }
        }}>
        nft checkout
      </button>
      {/* </PortkeyAssetProvider> */}
    </div>
  );
}
