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
  getChainInfo,
} from '@portkey/did-ui-react';
import { evokePortkey } from '@portkey/onboarding';
import { message, Button } from 'antd';
import { useEffect, useState } from 'react';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';

ConfigProvider.setGlobalConfig({
  loginConfig: {
    loginMethodsOrder: ['Email', 'Google', 'Apple', 'Scan'],
    recommendIndexes: [0, 1],
  },
  requestDefaults: {
    timeout: 30000,
    baseURL: 'https://aa-portkey-test.portkey.finance',
  },
  serviceUrl: 'https://aa-portkey-test.portkey.finance',
});

const originChainId = 'tDVV';

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
            const wallet = await did.load('111111');
            console.log(wallet, 'wallet==');
            const chainInfo = await getChainInfo(originChainId);
            const spender = chainInfo.defaultToken.address;
            const caHash = did.didWallet.caInfo[originChainId].caHash;
            const result = await managerApprove({
              originChainId: originChainId,
              symbol: 'ELF',
              caHash,
              amount: 1e8 * 67,
              targetChainId: originChainId,
              networkType: 'TESTNET',
              showBatchApproveToken: true,
              dappInfo: {
                icon: 'https://icon.horse/icon/localhost:3000/50',
                href: 'http://localhost:3000',
                name: 'localhost',
              },
              spender: chainInfo.defaultToken.address,
            });
            console.log(result, 'result===');
            const [portkeyContract, tokenContract] = await Promise.all(
              [chainInfo.caContractAddress, chainInfo.defaultToken.address].map(ca =>
                getContractBasic({
                  contractAddress: ca,
                  account: aelf.getWallet(did.didWallet.managementAccount?.privateKey || ''),
                  rpcUrl: chainInfo.endPoint,
                }),
              ),
            );

            const approveResult = await portkeyContract.callSendMethod('ManagerApprove', '', {
              caHash,
              spender,
              symbol: (result as any).batchApproveToken ? '*' : 'ELF',
              amount: result.amount,
              guardiansApproved: result.guardiansApproved,
            });
            if (approveResult.error) {
              console.error(approveResult.error);
              return;
            }

            const allowanceRes = await Promise.all(
              ['ELF', 'ETH', 'SGRTEST-1', '*'].map(item =>
                tokenContract.callViewMethod('GetAvailableAllowance', {
                  symbol: item,
                  owner: did.didWallet.aaInfo.accountInfo?.caAddress,
                  spender,
                }),
              ),
            );
            console.log(allowanceRes, 'allowanceRes===');
          } catch (error) {
            message.error(handleErrorMessage(error));
          }
        }}>
        managerApprove
      </Button>

      <div>-----</div>
      <PortkeyProvider sandboxId="" networkType="MAINNET">
        <Button
          onClick={async () => {
            try {
              await did.load('111111');

              const result = await checkWalletSecurity({
                originChainId: originChainId,
                targetChainId: originChainId,
                caHash: did.didWallet.caInfo[originChainId].caHash,
                networkType: 'MAINNET',
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

      <PortkeyAssetProvider pin="111111" originChainId="tDVW">
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
