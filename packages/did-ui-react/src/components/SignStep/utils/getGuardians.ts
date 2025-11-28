import { ChainId, ChainType } from '@portkey/types';
import { getChainInfo } from '../../../hooks/useChainInfo';
import { getVerifierList } from '../../../utils/sandboxUtil/getVerifierList';
import { did } from '../../../utils';
import { VerifierItem } from '@portkey/did';
import { AccountType, Guardian } from '@portkey/services';

interface FetchVerifierProps {
  originChainId: ChainId;
  sandboxId?: string;
  chainType?: ChainType;
}

export const getVerifierListHandler = async ({ originChainId, sandboxId, chainType }: FetchVerifierProps) => {
  const chainInfo = await getChainInfo(originChainId);
  if (!chainInfo) return;
  const list = await getVerifierList({
    sandboxId,
    chainId: originChainId,
    rpcUrl: chainInfo.endPoint,
    chainType: chainType ?? 'aelf',
    address: chainInfo.caContractAddress,
  });
  return list;
};

export const getGuardianList = async ({
  identifier,
  originChainId,
  caHash,
  ...props
}: { identifier?: string; caHash?: string } & FetchVerifierProps) => {
  if (!(caHash || identifier)) throw 'Param is not valid';
  const verifierList = await getVerifierListHandler({ originChainId, ...props });
  if (!verifierList) throw 'Fetch verifier list error';
  const verifierMap: { [x: string]: VerifierItem } = {};
  verifierList?.forEach((item) => {
    verifierMap[item.id] = item;
  });

  const params = identifier
    ? {
        loginGuardianIdentifier: identifier.replaceAll(/\s/g, ''),
      }
    : {
        caHash,
      };

  const payload = await did.getHolderInfo(Object.assign(params, { chainId: originChainId }));

  const { guardians } = payload?.guardianList ?? { guardians: [] };

  return guardians.map((_guardianAccount) => {
    const key = `${_guardianAccount.guardianIdentifier}&${_guardianAccount.verifierId}`;

    const guardianAccount = _guardianAccount.guardianIdentifier || _guardianAccount.identifierHash;
    const verifier = verifierMap?.[_guardianAccount.verifierId];

    const baseGuardian: Guardian & {
      verifier?: VerifierItem;
      key: string;
      identifier: string;
      guardianType: AccountType;
    } = {
      ..._guardianAccount,
      key,
      verifier,
      identifier: guardianAccount,
      guardianType: _guardianAccount.type,
    };

    return baseGuardian;
  });
};
