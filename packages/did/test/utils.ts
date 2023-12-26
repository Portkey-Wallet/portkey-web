import { IHolderInfo } from '@portkey-v1/services';
import { VerifierItem, GuardianType } from '../src/types';

export function handleUserGuardiansList(
  holderInfo: IHolderInfo,
  verifierServers: VerifierItem[] | { [key: string]: VerifierItem },
) {
  const { guardianList } = holderInfo;
  return guardianList.guardians.map(item => {
    return {
      ...item,
      guardianAccount: item.guardianIdentifier || item.identifierHash,
      guardianType: typeof item.type === 'string' ? GuardianType[item.type] : item.type,
      key: `${item.guardianIdentifier}&${item.verifierId}`,
      verifier: Array.isArray(verifierServers)
        ? verifierServers.find(verifierItem => verifierItem.id === item.verifierId)
        : verifierServers[item.verifierId],
      isLoginAccount: item.isLoginGuardian,
    };
  });
}
