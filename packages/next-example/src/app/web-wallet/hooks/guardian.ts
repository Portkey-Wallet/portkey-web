import { useCallback, useState } from 'react';
import { did } from '@portkey/did-ui-react';
import { AccountType, Guardian } from '@portkey/services';
import { ChainId } from '@portkey/provider-types';

const useGuardianList = () => {
  const [currentGuardianList, setCurrentGuardianList] = useState<
    (Guardian & {
      guardianType: AccountType;
      key: string;
    })[]
  >([]);

  const getCurrentGuardianList = useCallback(async (originChainId: ChainId, caHash: string) => {
    const payload = await did.getHolderInfo({ chainId: originChainId, caHash });
    const { guardians } = payload?.guardianList ?? { guardians: [] };
    const _guardian = guardians.map(ele => ({
      ...ele,
      guardianType: ele.type,
      key: `${ele.guardianIdentifier}&${ele.verifierId}`,
      identifier: ele.guardianIdentifier || ele.identifierHash,
    }));

    setCurrentGuardianList(_guardian);
  }, []);

  return { currentGuardianList, getCurrentGuardianList };
};

export default useGuardianList;
