import { useCallback } from 'react';
import { useVerifyToken } from './authentication';
import { ISocialLogin, IVerificationInfo, UserGuardianStatus, VerifyStatus } from '../types';
import { handleVerificationDoc } from '../utils';

export const useMultiVerify = () => {
  const verifyToken = useVerifyToken();

  return useCallback(
    async (guardianList: UserGuardianStatus[]) => {
      console.log('guardianList-useMultiVerify', guardianList);
      const res = Promise.all(
        guardianList.map(async (item) => {
          if (item.status === VerifyStatus.Verified) return item;
          if (!item.asyncVerifyInfoParams) return;

          const rst = await verifyToken(item.guardianType as ISocialLogin, item.asyncVerifyInfoParams);

          if (!rst || !(rst.verificationDoc || rst.zkLoginInfo)) return;

          const verifierInfo: IVerificationInfo = { ...rst, verifierId: item?.verifier?.id };

          const guardianIdentifier = rst.zkLoginInfo
            ? rst.zkLoginInfo.identifierHash
            : handleVerificationDoc(verifierInfo.verificationDoc as string).guardianIdentifier;

          return {
            ...item,
            status: VerifyStatus.Verified,
            verificationDoc: verifierInfo.verificationDoc,
            signature: verifierInfo.signature,
            identifierHash: guardianIdentifier,
            zkLoginInfo: rst.zkLoginInfo,
          };
        }),
      );
      return res;
    },
    [verifyToken],
  );
};
