import { message } from 'antd';
import { useCallback, useMemo, useRef } from 'react';
import { did, randomId, setLoading } from '../../utils';
import { ACH_MERCHANT_NAME, SELL_SOCKET_TIMEOUT, STAGE } from '../../constants/ramp';
import SparkMD5 from 'spark-md5';
import AElf from 'aelf-sdk';
import { ISellTransferParams, SellTransferParams, IUseHandleAchSellParams } from '../../types';
import { timesDecimals } from '../../utils/converter';
import { signalrSell } from '@portkey/socket';
import { RequestOrderTransferredType, AchTxAddressReceivedType } from '@portkey/socket';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import getTransactionRaw from '../../sandbox/getTransactionRaw';
import { usePortkey } from '../context';

export const useSellTransfer = ({ isMainnet }: ISellTransferParams) => {
  const status = useRef<STAGE>(STAGE.ACHTXADS);

  return useCallback(
    async ({ merchantName, orderId, paymentSellTransfer }: SellTransferParams) => {
      if (!isMainnet || merchantName !== ACH_MERCHANT_NAME) return;

      let signalrAchTxRemove: (() => void) | undefined;
      let signalrOrderRemove: (() => void) | undefined;
      let timer: NodeJS.Timeout | undefined = undefined;
      const clientId = randomId();

      try {
        await signalrSell.doOpen({
          url: `/ca`,
          clientId,
        });
      } catch (error) {
        throw new Error('Transaction failed.');
      }

      const timerPromise = new Promise<'timeout'>((resolve) => {
        timer = setTimeout(() => {
          resolve('timeout');
        }, SELL_SOCKET_TIMEOUT);
      });

      const signalrSellPromise = new Promise<RequestOrderTransferredType | null>((resolve) => {
        const { remove: removeAchTx } = signalrSell.onAchTxAddressReceived({ clientId, orderId }, async (data) => {
          if (data === null) {
            throw new Error('Transaction failed.');
          }

          try {
            status.current = STAGE.TRANSACTION;
            const result = await paymentSellTransfer(data);
            await did.rampServices.sendSellTransaction({
              merchantName: ACH_MERCHANT_NAME,
              orderId,
              rawTransaction: result.rawTransaction,
              signature: result.signature,
              publicKey: result.publicKey,
            });
          } catch (e) {
            resolve(null);
            return;
          }

          const { remove: removeRes } = signalrSell.onRequestOrderTransferred({ clientId, orderId }, async (data) => {
            status.current = STAGE.ORDER;
            resolve(data);
          });
          signalrOrderRemove = removeRes;
          signalrSell.requestOrderTransferred(clientId, orderId);
        });
        signalrAchTxRemove = removeAchTx;
        signalrSell.requestAchTxAddress(clientId, orderId);
      });

      const signalrSellResult = await Promise.race([timerPromise, signalrSellPromise]);

      if (signalrSellResult === null) throw new Error('Transaction failed.');
      if (signalrSellResult === 'timeout') {
        if (status.current === STAGE.ACHTXADS) throw new Error('Transaction failed.');
        throw {
          code: 'TIMEOUT',
          message: 'The waiting time is too long, it will be put on hold in the background.',
        };
      }
      if (signalrSellResult.status !== 'Transferred') throw new Error('Transaction failed.');

      signalrAchTxRemove?.();
      signalrAchTxRemove = undefined;
      signalrOrderRemove?.();
      signalrOrderRemove = undefined;

      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      signalrSell.stop();
    },
    [isMainnet],
  );
};

export const useHandleAchSell = ({ isMainnet, chainInfo, tokenInfo }: IUseHandleAchSellParams) => {
  const sellTransfer = useSellTransfer({ isMainnet });

  const [{ chainType }] = usePortkey();

  const [{ managementAccount, caInfo, originChainId }] = usePortkeyAsset();
  const privateKey = useMemo(() => managementAccount?.wallet?.privateKey, [managementAccount?.wallet?.privateKey]);
  const keyPair = useMemo(() => managementAccount?.wallet?.keyPair, [managementAccount?.wallet?.keyPair]);

  const paymentSellTransfer = useCallback(
    async (params: AchTxAddressReceivedType) => {
      if (!chainInfo) throw new Error('Sell Transfer: No ChainInfo');

      if (!privateKey) throw new Error('Sell Transfer: No PrivateKey');

      if (!tokenInfo) throw new Error('Sell Transfer: No Token');

      if (!keyPair) throw new Error('Sell Transfer: No keyPair');

      const rawResult = await getTransactionRaw({
        contractAddress: chainInfo.caContractAddress,
        rpcUrl: chainInfo?.endPoint || '',
        chainType: chainType,
        methodName: 'ManagerForwardCall',
        privateKey,
        paramsOption: {
          caHash: caInfo?.[originChainId]?.caHash || '',
          contractAddress: tokenInfo.tokenContractAddress || '',
          methodName: 'Transfer',
          args: {
            symbol: tokenInfo.symbol,
            to: `ELF_${params.address}_AELF`,
            amount: timesDecimals(params.cryptoAmount, tokenInfo.decimals).toNumber(),
          },
        },
      });
      if (!rawResult || !rawResult.result) {
        throw new Error('Failed to get raw transaction.');
      }
      const publicKey = keyPair.getPublic('hex');
      const message = SparkMD5.hash(`${params.orderId}${rawResult.result.data}`);
      const signature = AElf.wallet.sign(Buffer.from(message).toString('hex'), keyPair).toString('hex');
      return {
        rawTransaction: rawResult.result.data,
        publicKey,
        signature,
      };
    },
    [caInfo, chainInfo, keyPair, originChainId, privateKey, tokenInfo, chainType],
  );

  return useCallback(
    async (orderId: string) => {
      try {
        setLoading(true, 'Payment is being processed and may take around 10 seconds to complete.');
        await sellTransfer({
          merchantName: ACH_MERCHANT_NAME,
          orderId,
          paymentSellTransfer,
        });
        message.success('Transaction completed.');
      } catch (error: any) {
        if (error?.code === 'TIMEOUT') {
          message.warn(error?.message || 'The waiting time is too long, it will be put on hold in the background.');
        } else {
          message.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [paymentSellTransfer, sellTransfer],
  );
};
