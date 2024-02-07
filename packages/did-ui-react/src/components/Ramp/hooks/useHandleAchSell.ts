import { useCallback, useRef } from 'react';
import { did, handleErrorMessage, setLoading } from '../../../utils';
import SparkMD5 from 'spark-md5';
import AElf from 'aelf-sdk';
import { IUseHandleAchSellParams } from '../../../types';
import { timesDecimals } from '../../../utils/converter';
import { getCATransactionRaw } from '../../../utils/sandboxUtil/getCATransactionRaw';
import { getChain } from '../../../hooks/useChainInfo';
import { IBaseWalletAccount } from '@portkey/types';
import { CAInfo } from '@portkey/did';
import { usePortkeyAsset } from '../../context/PortkeyAssetProvider';
import { usePortkey } from '../../context';
import singleMessage from '../../CustomAnt/message';
import { PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST } from '../../../constants/storage';
import ramp, { IOrderInfo } from '@portkey/ramp';
import { MAIN_CHAIN_ID } from '../../../constants/network';

interface TransferParams {
  symbol: string;
  to: string;
  amount: number;
}

const useHandleAchSell = ({ tokenInfo, portkeyWebSocketUrl }: IUseHandleAchSellParams) => {
  const chainId = useRef(tokenInfo?.chainId || MAIN_CHAIN_ID);
  const [{ chainType }] = usePortkey();
  const [{ managementAccount, caInfo, initialized }] = usePortkeyAsset();
  const managementAccountRef = useRef<IBaseWalletAccount | undefined>(managementAccount);
  const caInfoRef = useRef<{ [key: string]: CAInfo } | undefined>(caInfo);
  const initializedRef = useRef<boolean>(!!initialized);

  const paymentSellTransfer = useCallback(
    async (params: IOrderInfo) => {
      const chainInfo = await getChain(chainId.current);
      const privateKey = managementAccount?.wallet?.privateKey;
      const keyPair = managementAccount?.wallet?.keyPair;

      if (!chainInfo) throw new Error('Sell Transfer: No ChainInfo');

      if (!privateKey) throw new Error('Sell Transfer: No PrivateKey');

      if (!tokenInfo) throw new Error('Sell Transfer: No Token');

      if (!keyPair) throw new Error('Sell Transfer: No keyPair');

      const guardiansApprovedStr = await did.config.storageMethod.getItem(
        `${PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST}_${params.orderId}`,
      );
      let guardiansApprovedParse;
      try {
        guardiansApprovedParse =
          typeof guardiansApprovedStr === 'string' && guardiansApprovedStr.length > 0
            ? JSON.parse(guardiansApprovedStr)
            : undefined;
      } catch (error) {
        console.log('json parse error');
        guardiansApprovedParse = undefined;
      }

      const rawResult = await getCATransactionRaw<TransferParams>({
        chainId: chainId.current,
        contractAddress: tokenInfo.tokenContractAddress || '',
        chainType,
        privateKey,
        methodName: 'Transfer',
        caHash: caInfo?.[chainId.current]?.caHash || '',
        paramsOption: {
          symbol: tokenInfo.symbol,
          to: `ELF_${params.address}_AELF`,
          amount: timesDecimals(params.cryptoAmount, tokenInfo.decimals).toNumber(),
        },
        callOptions: { appendParams: { guardiansApproved: guardiansApprovedParse } },
      });
      if (!rawResult) {
        throw new Error('Failed to get raw transaction.');
      }
      await did.config.storageMethod.removeItem(`${PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST}_${params.orderId}`);
      const publicKey = keyPair.getPublic('hex');
      const message = SparkMD5.hash(`${params.orderId}${rawResult}`);
      const signature = AElf.wallet.sign(Buffer.from(message).toString('hex'), keyPair).toString('hex');
      return {
        rawTransaction: rawResult,
        publicKey,
        signature,
      };
    },
    [caInfo, chainType, managementAccount?.wallet?.keyPair, managementAccount?.wallet?.privateKey, tokenInfo],
  );

  return useCallback(
    async ({ orderId, isMainnet }: { orderId: string; isMainnet: boolean }) => {
      try {
        if (isMainnet && initializedRef && managementAccountRef.current && caInfoRef.current) {
          setLoading(true, 'Payment is being processed and may take around 10 seconds to complete.');
          // TODO ramp set baseurl: portkeyWebSocketUrl
          await ramp.transferCrypto(orderId, paymentSellTransfer);
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
    [paymentSellTransfer],
  );
};

export default useHandleAchSell;
