import { useCallback } from 'react';
import { useVerifyToken } from './authentication';
import { ISocialLogin, IVerificationInfo, UserGuardianStatus, VerifyStatus } from '../types';
import { formatGuardianValue, handleVerificationDoc } from '../utils';
import { GuardiansApproved } from '@portkey/services';

export const useMultiVerify = () => {
  const verifyToken = useVerifyToken();

  return useCallback(
    async (guardianList: UserGuardianStatus[]) => {
      console.log('guardianList-useMultiVerify', guardianList);
      const res = await Promise.all(
        guardianList.map(async (item) => {
          if (item.status === VerifyStatus.Verified)
            return {
              type: item.guardianType,
              identifier: item.guardianIdentifier || '',
              verifierId: item.verifier?.id || '',
              verificationDoc: item.verificationDoc || '',
              signature: item.signature || '',
              identifierHash: item.guardianIdentifier || '',
              zkLoginInfo: item.zkLoginInfo,
            };
          if (!item.asyncVerifyInfoParams) return {};

          const rst = await verifyToken(item.guardianType as ISocialLogin, item.asyncVerifyInfoParams);

          if (!rst || !(rst.verificationDoc || rst.zkLoginInfo)) return {};

          const verifierInfo: IVerificationInfo = { ...rst, verifierId: item?.verifier?.id };

          const guardianIdentifier = rst.zkLoginInfo
            ? rst.zkLoginInfo.identifierHash
            : handleVerificationDoc(verifierInfo.verificationDoc as string).guardianIdentifier;

          return {
            type: item.guardianType,
            identifier: item.guardianIdentifier || '',
            verifierId: item.verifier?.id || '',
            verificationDoc: verifierInfo.verificationDoc || '',
            signature: verifierInfo.signature || '',
            identifierHash: guardianIdentifier,
            zkLoginInfo: rst.zkLoginInfo,
          };
        }),
      );
      const _res = res.filter((item) => Boolean(item));
      return formatGuardianValue(_res as GuardiansApproved[]);
    },
    [verifyToken],
  );
};
