import { useState, useMemo } from 'react';
import { CAInfo } from '@portkey-v1/did';
import { ChainId } from '@portkey-v1/types';
import { did } from '../utils';
import useInterval from './useInterval';
import { ManagerInfoType } from '../components';
import { AccountType, AccountTypeEnum } from '@portkey-v1/services';

export function useIntervalQueryCAInfo({ address }: { address?: string; chainId?: ChainId }) {
  const [info, setInfo] = useState<{ info: CAInfo; chainId: ChainId; accountInfo: ManagerInfoType }>();
  const caInfo = useMemo(() => (address && info ? info : undefined), [info, address]);
  const intervalHandler = useInterval(
    async () => {
      if (!address || caInfo) return;
      try {
        const result = await did.getHolderInfo({
          manager: address,
        });
        const { caAddress, caHash, originChainId, loginGuardianInfo } = result[0];
        if (caAddress && caHash && loginGuardianInfo[0])
          setInfo({
            info: {
              caAddress,
              caHash,
            },
            accountInfo: {
              managerUniqueId: loginGuardianInfo[0].id as string,
              guardianIdentifier: loginGuardianInfo[0].loginGuardian!.identifierHash as string,
              accountType: AccountTypeEnum[loginGuardianInfo[0].loginGuardian!.type] as AccountType,
              type: 'addManager',
            },
            chainId: originChainId as any,
          });
      } catch (error) {
        console.log(error, '=====error');
      }
    },
    3000,
    [caInfo, address],
  );
  return [caInfo, intervalHandler] as const;
}
