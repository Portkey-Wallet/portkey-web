import { useCallback } from 'react';
import { AchTokenInfoType } from '../../types';
import { AccountTypeEnum, Guardian } from '@portkey-v1/services';
import { getAchToken } from './utils';

export const useGetAchTokenInfo = () => {
  return useCallback(async (userGuardiansList: Guardian[]): Promise<AchTokenInfoType | undefined> => {
    if (userGuardiansList === undefined) {
      throw new Error('userGuardiansList is undefined');
    }

    const emailGuardian = userGuardiansList?.find(
      (item) => item.type === AccountTypeEnum[AccountTypeEnum.Email] && item.isLoginGuardian,
    );
    if (emailGuardian === undefined || !emailGuardian?.guardianIdentifier) {
      return undefined;
    }

    const rst = await getAchToken({ email: emailGuardian.guardianIdentifier });
    const achTokenInfo = {
      token: rst.accessToken,
      expires: Date.now() + 24 * 60 * 60 * 1000,
    };

    return achTokenInfo;
  }, []);
};
