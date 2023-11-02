import {
  handleErrorMessage,
  managerApprove,
  checkWalletSecurity,
  ConfigProvider,
  did,
  PortkeyProvider,
} from '@portkey/did-ui-react';
import { evokePortkey } from '@portkey/onboarding';
import { aelf } from '@portkey/utils';
import { message } from 'antd';
import { useEffect, useState } from 'react';
ConfigProvider.setGlobalConfig({
  // test3
  serviceUrl: 'http://192.168.66.203:5001',
});

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

            console.log(guardiansApproved, 'guardiansApproved===');
            const contract = await getContractBasic({
              contractAddress: chainInfo.caContractAddress,
              rpcUrl: chainInfo.endPoint,
              account: aelf.getWallet(did.didWallet.managementAccount.privateKey),
            });
            const options = {
              caHash: did.didWallet.caInfo['AELF'].caHash,
              spender: chainInfo.caContractAddress,
              symbol: 'ELF',
              amount,
              guardiansApproved,
            };

            console.log(options, 'options==');

            const result = await contract.callSendMethod('ManagerApprove', '', options);
            console.log(result, 'ManagerApprove==result====');
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
