'use client';
import { DialogExample, useConnect } from '@portkey/connect-web-wallet';
import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Actions, State, useExampleState } from './hooks';
import detectProvider from '@portkey/detect-provider';
import {
  Accounts,
  ChainIds,
  IAElfChain,
  MethodsBase,
  MethodsWallet,
  NetworkType,
  NotificationEvents,
  ProviderErrorType,
} from '@portkey/provider-types';
import { IContract } from '@portkey/types';
import elliptic from 'elliptic';
import AElf from 'aelf-sdk';
import { scheme, sigObjToStr, aelf } from '@portkey/utils';
import { createManagerForwardCall, getTxResult } from '@portkey/contracts';
import { getRawParams } from './decodeTx';

const TokenContractAddressMap = {
  AELF: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
  tDVV: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
  tDVW: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
};
const ec = new elliptic.ec('secp256k1');
export default function ConnectWallet() {
  const { connect, disconnect, provider } = useConnect();
  const [state, dispatch] = useExampleState();

  const onConnect = useCallback(async () => {
    const result = await connect();
    console.log(result, 'result=====onConnect');
  }, [connect]);

  const initProvider = useCallback(async () => {
    const provider = await detectProvider({ providerName: 'PortkeyWebWallet' as any });
    console.log(provider, 'providerName');
  }, []);

  const setState = useCallback((payload: State, actions: Actions = Actions.setState) => {
    dispatch({ type: actions, payload });
  }, []);

  const accountsChanged = (accounts: Accounts) => {
    setState({ accounts });
  };
  const chainChanged = (chainIds: ChainIds) => {
    setState({ chainIds });
  };

  const [chain, setChain] = useState<IAElfChain>();
  const [tokenContract, setTokenContract] = useState<IContract>();

  const networkChanged = async (networkType: NetworkType) => {
    setState({ network: networkType });
    const _chain = await provider?.getChain('AELF');
    setChain(_chain);
  };
  const connected = async (connectInfo: NetworkType) => {
    const result = await provider?.request({
      method: MethodsBase.ACCOUNTS,
    });
    setState({ accounts: result });
  };
  const disconnected = (error: ProviderErrorType) => {
    console.log(error, '=====disconnected');
  };

  const initListener = () => {
    provider?.on(NotificationEvents.ACCOUNTS_CHANGED, accountsChanged);
    provider?.on(NotificationEvents.CHAIN_CHANGED, chainChanged);
    provider?.on(NotificationEvents.NETWORK_CHANGED, networkChanged);
    provider?.on(NotificationEvents.CONNECTED, connected);
    provider?.on(NotificationEvents.DISCONNECTED, disconnected);
  };
  const removeListener = () => {
    provider?.removeListener(NotificationEvents.ACCOUNTS_CHANGED, accountsChanged);
    provider?.removeListener(NotificationEvents.CHAIN_CHANGED, chainChanged);
    provider?.removeListener(NotificationEvents.NETWORK_CHANGED, networkChanged);
    provider?.removeListener(NotificationEvents.CONNECTED, connected);
    provider?.removeListener(NotificationEvents.DISCONNECTED, disconnected);
  };
  useEffect(() => {
    if (!provider) return;
    initListener();
    return () => {
      removeListener();
    };
  }, [provider]);
  return (
    <div>
      {Object.entries(state).map(([key, value]) => {
        return (
          <p key={key}>
            <a>{key}</a>
            <br />
            {JSON.stringify(value)}
          </p>
        );
      })}
      <Button onClick={initProvider}>init provider</Button>

      <Button
        onClick={async () => {
          alert(provider?.isConnected());
        }}>
        isConnected
      </Button>
      <Button onClick={onConnect}>connect</Button>
      <Button onClick={disconnect}>disconnect</Button>
      <Button
        onClick={async () => {
          try {
            const _chainId = 'tDVW';
            const _chain = await provider?.getChain(_chainId);
            if (!_chain) return;
            setChain(_chain);
            setTokenContract(_chain.getContract(TokenContractAddressMap[_chainId]));
          } catch (error) {
            console.log(error, '=====getChain');
          }
        }}>
        getChain
      </Button>
      <Button
        onClick={async () => {
          try {
            const _chain = await provider?.getChain('tDVV');
            setChain(_chain);
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        getChain Error
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!chain) return;
            const height = await chain.getBlockHeight();
            console.log(height, '====height');
            alert(height);
          } catch (error) {
            console.log(error, '====error');
          }
        }}>
        getBlockHeight
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!tokenContract) return;
            const balance = await tokenContract.callViewMethod('GetBalance', {
              symbol: 'ELF',
              owner: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
            });
            console.log(balance, '=====balance');
          } catch (error) {
            console.log(error, '====error');
          }
        }}>
        GetBalance
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!tokenContract) return;

            console.log('====tokenContract', tokenContract);

            const balance = await tokenContract.callSendMethod('Transfer', '', {
              symbol: 'ELF',
              to: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
              amount: 1,
            });
            console.log(balance, '=====balance');
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        Transfer
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;
            const sin = await provider.request({
              method: MethodsWallet.GET_WALLET_SIGNATURE,
              payload: { data: Date.now().toString() },
            });
            console.log(sin, '=======sin');
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        GET_WALLET_SIGNATURE
      </Button>
      <Button
        onClick={async () => {
          const data = `Welcome to provider example!
Please make sure you understand the effect of this signature.

timestamp:
${Date.now()}`;

          const hexData = Buffer.from(data).toString('hex');
          try {
            if (!provider) return;
            const sin = await provider.request({
              method: MethodsWallet.GET_WALLET_TRANSACTION_SIGNATURE,
              payload: { hexData },
            });
            const publicKey = ec.recoverPubKey(
              Buffer.from(AElf.utils.sha256(Buffer.from(hexData, 'hex')), 'hex'),
              sin,
              sin.recoveryParam,
            );
            const pubKey = ec.keyFromPublic(publicKey).getPublic('hex');
            const recoverManagerAddress = AElf.wallet.getAddressFromPubKey(publicKey);

            const managerAddress = await provider.request({
              method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
            });
            console.log(
              pubKey,
              recoverManagerAddress,
              managerAddress,
              managerAddress === recoverManagerAddress,
              '======pubKey',
            );
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        GET_WALLET_TRANSACTION_SIGNATURE
      </Button>

      <Button
        onClick={async () => {
          const data = `Welcome to provider example!
Please make sure you understand the effect of this signature.

timestamp:
${Date.now()}`;

          const hexData = Buffer.from(data).toString('hex');
          try {
            if (!provider) return;
            const sin = await provider.request({
              method: 'wallet_getManagerSignature',
              payload: { hexData },
            });

            console.log(sin, 'sin===');
            const publicKey = ec.recoverPubKey(Buffer.from(AElf.utils.sha256(hexData), 'hex'), sin, sin.recoveryParam);
            const pubKey = ec.keyFromPublic(publicKey).getPublic('hex');
            const recoverManagerAddress = AElf.wallet.getAddressFromPubKey(publicKey);

            const managerAddress = await provider.request({
              method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
            });
            console.log(
              pubKey,
              recoverManagerAddress,
              managerAddress,
              managerAddress === recoverManagerAddress,
              '======pubKey',
            );
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        GET_WALLET_MANAGER_SIGNATURE
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;
            const ManagerForwardCall = 'ManagerForwardCall';
            const CAContractAddress = '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb';
            const rpcUrl = 'https://aelf-test-node.aelf.io';
            const instance = aelf.getAelfInstance(rpcUrl);
            const caHash = await provider.request({
              method: MethodsBase.CA_HASH,
            });
            const [managerForwardCall, managerAddress] = await Promise.all([
              createManagerForwardCall({
                instance,
                paramsOption: {
                  contractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
                  methodName: 'Transfer',
                  args: {
                    to: 'ELF_6Lr5NR3s1AtXTNzh7CVmBJbWLKCVHnWeHeKRYbfQBCYXeWqSf_AELF',
                    symbol: 'ELF',
                    amount: '1',
                  },
                  caHash: caHash,
                },
                caContractAddress: CAContractAddress,
              }),
              provider.request({
                method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
              }),
            ]);

            const { BestChainHeight, BestChainHash } = await instance.chain.getChainStatus();

            // Create transaction
            const rawTx = aelf.getRawTx({
              blockHeightInput: BestChainHeight,
              blockHashInput: BestChainHash,
              packedInput: managerForwardCall,
              address: managerAddress,
              contractAddress: CAContractAddress,
              functionName: ManagerForwardCall,
            });
            console.log(rawTx, 'rawTx===');
            rawTx.params = Buffer.from(rawTx.params, 'hex');

            const signData = aelf.encodeTransaction(rawTx);

            console.log(signData, 'signData===');

            const instance1 = new AElf(new AElf.providers.HttpProvider(rpcUrl));

            const p = await getRawParams(instance1, signData);
            console.log(p, '===getRawParams');

            const sin = await provider.request({
              method: MethodsWallet.GET_WALLET_TRANSACTION_SIGNATURE,
              payload: { data: aelf.encodeTransaction(rawTx) },
            });

            const transaction = aelf.encodeTransaction({
              ...rawTx,
              signature: Buffer.from(sigObjToStr(sin as any), 'hex'),
            });

            const send = await instance.chain.sendTransaction(transaction);
            const txResult = await getTxResult(instance, send.TransactionId, -20);
            console.log(txResult, '=====txResult');
          } catch (error: any) {
            alert(error.message);
            console.log(error, '=====error');
          }
        }}>
        GET_WALLET_TRANSACTION_SIGNATURE Transfer
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;

            const network = await provider.request({
              method: MethodsBase.NETWORK,
            });
            setState({ network });
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        NETWORK
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!tokenContract) return;

            const balance = await tokenContract.callSendMethod(
              'Transfer',
              '',
              {
                symbol: 'ELF',
                to: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
                amount: 10000 * 10 ** 8,
              },
              { onMethod: 'receipt' },
            );
            console.log(balance, '=====balance');
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        Transfer receipt
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!tokenContract) return;
            const allowanceRes1 = (
              await Promise.all(
                ['ELF', 'ETH', 'SGRTEST-1', '*', 'SGRTEST-23', 'SGRTEST-0'].map(item =>
                  tokenContract.callViewMethod('GetAvailableAllowance', {
                    symbol: item,
                    owner: 'ELF_2LxtGrAkbzAgcBEqfPUuNNxeKsy5hmKFuySshoWwDBhb4iAZ6n_AELF',
                    spender: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
                  }),
                ),
              )
            ).map(res => res.data || res.error);
            console.log(allowanceRes1, 'allowanceRes===start');

            const approveReq = await tokenContract.callSendMethod(
              'Approve',
              '',
              {
                symbol: 'SGRTEST-20',
                spender: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
                amount: 10000 * 10 ** 8,
              },
              { onMethod: 'receipt' },
            );
            console.log(approveReq, '=======approveReq');

            // alert(JSON.stringify(approveReq));
            const allowanceRes = (
              await Promise.all(
                ['ELF', 'ETH', 'SGRTEST-1', '*', 'SGRTEST-23', 'SGRTEST-0'].map(item =>
                  tokenContract.callViewMethod('GetAvailableAllowance', {
                    symbol: item,
                    owner: 'ELF_2LxtGrAkbzAgcBEqfPUuNNxeKsy5hmKFuySshoWwDBhb4iAZ6n_AELF',
                    spender: 'LSWoBaeoXRp9QW75mCVJgNP4YurGi2oEJDYu3iAxtDH8R6UGy',
                  }),
                ),
              )
            ).map(res => res.data || res.error);
            console.log(allowanceRes, 'allowanceRes===');
          } catch (error: any) {
            console.log(error, '=====error');
            alert(error.message);
          }
        }}>
        Approve receipt
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;

            const result = await provider.request({
              method: MethodsBase.REQUEST_ACCOUNTS,
            });
            setState({ accounts: result });
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        onConnect
      </Button>
      <Button
        onClick={async () => {
          if (!provider) return;

          const result = await provider.request({
            method: MethodsBase.ACCOUNTS,
          });
          setState({ accounts: result });
        }}>
        ACCOUNTS
      </Button>
      <Button
        onClick={async () => {
          if (!provider) return;

          const result = await provider.request({
            method: MethodsBase.CHAIN_ID,
          });
          setState({ chainIds: result });
        }}>
        CHAIN_ID
      </Button>
      <Button
        onClick={async () => {
          if (!provider) return;

          const result = await provider.request({
            method: MethodsBase.CHAINS_INFO,
          });
          setState({ chainsInfo: result });
        }}>
        CHAINS_INFO
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;

            const walletName = await provider.request({
              method: MethodsWallet.GET_WALLET_NAME,
            });
            setState({ walletName });
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        GET_WALLET_NAME
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;

            const managerAddress = await provider.request({
              method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
            });
            setState({ managerAddress });
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        GET_WALLET_CURRENT_MANAGER_ADDRESS
      </Button>

      <form
        onSubmit={async e => {
          // console.log(e.target[0].value, 'onSubmit==');
          e.preventDefault();
          var formData = new FormData(e.target as any);
          try {
            if (!provider) return;

            const syncStatus = await provider.request({
              method: MethodsWallet.GET_WALLET_MANAGER_SYNC_STATUS,
              payload: { chainId: formData.get('chainId') || 'AELF' },
            });
            alert(syncStatus);
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        <label>
          ChainId:
          <input type="text" name="chainId" />
        </label>
        <button type="submit">GET_WALLET_MANAGER_SYNC_STATUS</button>
      </form>

      <Button onClick={removeListener}>removeListener</Button>
      <Button
        onClick={async () => {
          window.location.href = scheme.formatScheme({
            domain: window.location.host,
            action: 'linkDapp',
            custom: { url: window.location.href },
          });
        }}>
        linkDapp
      </Button>
      <Button
        onClick={async () => {
          try {
            if (!provider) return;

            const result = await provider.request({
              method: MethodsBase.SET_WALLET_CONFIG_OPTIONS,
              payload: { batchApproveNFT: true },
            });
            console.log('batchApproveNFT', result);
          } catch (error: any) {
            alert(error.message);
          }
        }}>
        batchApproveNFT
      </Button>
    </div>
  );
}
