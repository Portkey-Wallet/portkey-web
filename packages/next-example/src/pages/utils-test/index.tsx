import {
  handleErrorMessage,
  managerApprove,
  checkWalletSecurity,
  ConfigProvider,
  did,
  PortkeyProvider,
  PortkeyStyleProvider,
  singleMessage,
} from '@portkey/did-ui-react';
import { evokePortkey } from '@portkey/onboarding';
import { message } from 'antd';
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
      <button
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
      </button>
      {status}
      <div>--------</div>
      <button
        onClick={async () => {
          const result = await evokePortkey.extension();
          // singleMessage.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        extension
      </button>
      <div>-----</div>
      <button
        onClick={async () => {
          const result = await evokePortkey.thirdParty();
          // singleMessage.error(navigator.userAgent);
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

      <button
        onClick={async () => {
          try {
            const result = await managerApprove({
              originChainId: 'AELF',
              symbol: 'TOKEN',
              caHash: 'a79c76fd18879943980b9909f46ea644f9cd02eee5069d645d7046a874f7e212',
              amount: '999',
              targetChainId: 'AELF',
            });
            console.log(result, 'result===');
          } catch (error) {
            message.error(handleErrorMessage(error));
          }
        }}>
        managerApprove
      </button>

      <div>-----</div>
      <PortkeyProvider sandboxId="" networkType="MAIN">
        <button
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
        </button>
      </PortkeyProvider>
    </div>
  );
}
