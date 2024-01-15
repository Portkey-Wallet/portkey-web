import { useCallback, useRef } from 'react';
import { dealURLLastChar, did, handleErrorMessage, randomId, setLoading } from '../../utils';
import { ACH_MERCHANT_NAME, DEFAULT_CHAIN_ID, SELL_SOCKET_TIMEOUT, STAGE } from '../../constants/ramp';
import SparkMD5 from 'spark-md5';
import AElf from 'aelf-sdk';
import { ISellTransferParams, SellTransferParams, IUseHandleAchSellParams } from '../../types';
import { timesDecimals } from '../../utils/converter';
import { RequestOrderTransferredType, AchTxAddressReceivedType, signalrSell } from '@portkey/socket';
import { getCATransactionRaw } from '../../utils/sandboxUtil/getCATransactionRaw';
import { getChain } from '../../hooks/useChainInfo';
import { IBaseWalletAccount } from '@portkey/types';
import { CAInfo } from '@portkey/did';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { usePortkey } from '../context';
import singleMessage from '../CustomAnt/message';
import { PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST } from '../../constants/storage';

interface TransferParams {
  symbol: string;
  to: string;
  amount: number;
}

export const useSellTransfer = ({ isMainnet, portkeyWebSocketUrl }: ISellTransferParams) => {
  const status = useRef<STAGE>(STAGE.ACHTXADS);

  return useCallback(
    async ({ merchantName, orderId, managementAccount, caInfo, paymentSellTransfer }: SellTransferParams) => {
      if (!isMainnet || merchantName !== ACH_MERCHANT_NAME) return;

      let signalrAchTxRemove: (() => void) | undefined;
      let signalrOrderRemove: (() => void) | undefined;
      let timer: NodeJS.Timeout | undefined = undefined;
      const clientId = randomId();

      try {
        await signalrSell.doOpen({
          url: dealURLLastChar(portkeyWebSocketUrl),
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
        // Step1
        const { remove: removeAchTx } = signalrSell.onAchTxAddressReceived({ clientId, orderId }, async (data) => {
          if (data === null) {
            throw new Error('Transaction failed.');
          }
          // Step2
          try {
            status.current = STAGE.TRANSACTION;
            const result = await paymentSellTransfer({ ...data, managementAccount, caInfo });
            await did.services.ramp.sendSellTransaction({
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
          // Step3
          const { remove: removeRes } = signalrSell.onRequestOrderTransferred({ clientId, orderId }, async (data) => {
            status.current = STAGE.ORDER;
            resolve(data);
          });
          signalrOrderRemove = removeRes;
          signalrSell.requestOrderTransferred(clientId, orderId).catch(() => {
            resolve(null);
          });
        });
        signalrAchTxRemove = removeAchTx;

        signalrSell.requestAchTxAddress(clientId, orderId).catch(() => {
          resolve(null);
        });
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
    [isMainnet, portkeyWebSocketUrl],
  );
};

export const useHandleAchSell = ({ isMainnet, tokenInfo, portkeyWebSocketUrl }: IUseHandleAchSellParams) => {
  const sellTransfer = useSellTransfer({ isMainnet, portkeyWebSocketUrl });
  const chainId = useRef(tokenInfo?.chainId || DEFAULT_CHAIN_ID);
  const [{ chainType }] = usePortkey();

  const paymentSellTransfer = useCallback(
    async (
      params: AchTxAddressReceivedType & {
        managementAccount: IBaseWalletAccount;
        caInfo: {
          [key: string]: CAInfo;
        };
      },
    ) => {
      const chainInfo = await getChain(chainId.current);
      const privateKey = params.managementAccount?.wallet?.privateKey;
      const keyPair = params.managementAccount?.wallet?.keyPair;

      if (!chainInfo) throw new Error('Sell Transfer: No ChainInfo');

      if (!privateKey) throw new Error('Sell Transfer: No PrivateKey');

      if (!tokenInfo) throw new Error('Sell Transfer: No Token');

      if (!keyPair) throw new Error('Sell Transfer: No keyPair');

      const guardiansApprovedStr = localStorage.getItem(PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST);
      const rawResult = await getCATransactionRaw<TransferParams>({
        chainId: chainId.current,
        contractAddress: tokenInfo.tokenContractAddress || '',
        chainType,
        privateKey,
        methodName: 'Transfer',
        caHash: params.caInfo?.[chainId.current]?.caHash || '',
        paramsOption: {
          symbol: tokenInfo.symbol,
          to: `ELF_${params.address}_AELF`,
          amount: timesDecimals(params.cryptoAmount, tokenInfo.decimals).toNumber(),
        },
        callOptions: { appendParams: { guardiansApproved: guardiansApprovedStr } },
      });
      if (!rawResult) {
        throw new Error('Failed to get raw transaction.');
      }
      const publicKey = keyPair.getPublic('hex');
      const message = SparkMD5.hash(`${params.orderId}${rawResult}`);
      const signature = AElf.wallet.sign(Buffer.from(message).toString('hex'), keyPair).toString('hex');
      return {
        rawTransaction: rawResult,
        publicKey,
        signature,
      };
    },
    [chainType, tokenInfo],
  );
  const managementAccountRef = useRef<IBaseWalletAccount>();
  const caInfoRef = useRef<{ [key: string]: CAInfo }>();
  const initializedRef = useRef<boolean>();
  const [{ managementAccount, caInfo, initialized }] = usePortkeyAsset();

  managementAccountRef.current = managementAccount;
  caInfoRef.current = caInfo;
  initializedRef.current = initialized;

  return useCallback(
    async ({ orderId }: { orderId: string }) => {
      try {
        if (initializedRef && managementAccountRef.current && caInfoRef.current) {
          setLoading(true, 'Payment is being processed and may take around 10 seconds to complete.');
          await sellTransfer({
            merchantName: ACH_MERCHANT_NAME,
            orderId,
            managementAccount: managementAccountRef.current,
            caInfo: caInfoRef.current,
            paymentSellTransfer,
          });
          singleMessage.success('Transaction completed.');
        }
      } catch (error: any) {
        if (error?.code === 'TIMEOUT') {
          singleMessage.warn(
            handleErrorMessage(error, 'The waiting time is too long, it will be put on hold in the background.'),
          );
        } else {
          singleMessage.error(handleErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    },
    [paymentSellTransfer, sellTransfer],
  );
};
