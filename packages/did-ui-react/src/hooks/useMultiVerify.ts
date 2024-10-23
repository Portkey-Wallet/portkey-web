import { useCallback } from 'react';
import { useVerifyToken } from './authentication';
import { ISocialLogin, IVerificationInfo } from '../types';
import { handleVerificationDoc } from '../utils';
import { GuardiansApproved } from '@portkey/services';
import { VerifySocialLoginParams } from './authenticationAsync';

export const useMultiVerify = () => {
  const verifyToken = useVerifyToken();

  return useCallback(
    async (guardianList: (GuardiansApproved & { asyncVerifyInfoParams?: VerifySocialLoginParams })[]) => {
      console.log('guardianList-useMultiVerify', guardianList);
      const res = await Promise.all(
        guardianList.map(async (item) => {
          if (!item.asyncVerifyInfoParams) return item;

          const rst = await verifyToken(item.type as ISocialLogin, item.asyncVerifyInfoParams);

          if (!rst || !(rst.verificationDoc || rst.zkLoginInfo)) return {};

          const verifierInfo: IVerificationInfo = { ...rst, verifierId: item.verifierId };

          const guardianIdentifier = rst.zkLoginInfo
            ? rst.zkLoginInfo.identifierHash
            : handleVerificationDoc(verifierInfo.verificationDoc as string).guardianIdentifier;

          return {
            type: item.type,
            identifier: item.identifier || '',
            verifierId: item.verifierId || '',
            verificationDoc: verifierInfo.verificationDoc || '',
            signature: verifierInfo.signature || '',
            identifierHash: guardianIdentifier,
            zkLoginInfo: rst.zkLoginInfo,
          };
        }),
      );
      return res.filter((item) => Boolean(item));
    },
    [verifyToken],
  );
};
