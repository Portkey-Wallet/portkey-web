import { useCallback } from 'react';
import { MAINNET, MAIN_CHAIN_ID } from '../constants/network';
import { IFaucetConfig } from '../components/types/assets';
import { handleErrorMessage, setLoading } from '../utils';
import { callCASendMethod } from '../utils/sandboxUtil/callCASendMethod';
import { timesDecimals } from '../utils/converter';
import { usePortkey } from '../components/context';
import { singleMessage, usePortkeyAsset } from '../components';

export const useFaucet = (faucet?: IFaucetConfig) => {
  const [{ sandboxId, networkType, chainType }] = usePortkey();
  const [{ caHash, managementAccount }] = usePortkeyAsset();
  return useCallback(async () => {
    const faucetUrl = faucet?.faucetUrl;
    const faucetContractAddress = faucet?.faucetContractAddress;
    if (faucetUrl && networkType !== MAINNET) return window.open(faucetUrl);
    if (!faucetContractAddress) return singleMessage.error('Please configure `faucets`');
    if (!caHash || !managementAccount?.privateKey) return singleMessage.error('Please confirm whether to log in!');
    try {
      setLoading(true);
      const result = await callCASendMethod({
        methodName: 'ClaimToken',
        paramsOption: {
          symbol: 'ELF',
          amount: timesDecimals(100, 8).toString(),
        },
        sandboxId,
        chainId: MAIN_CHAIN_ID,
        caHash,
        chainType,
        contractAddress: faucetContractAddress,
        privateKey: managementAccount.privateKey,
      });
      setLoading(false);
      singleMessage.success('Token successfully requested');
      // TODO
      console.log(result, 'result==callCASendMethod');
    } catch (error) {
      setLoading(false);
      singleMessage.error(handleErrorMessage(error));
    }
  }, [caHash, chainType, faucet?.faucetContractAddress, faucet?.faucetUrl, managementAccount, networkType, sandboxId]);
};
