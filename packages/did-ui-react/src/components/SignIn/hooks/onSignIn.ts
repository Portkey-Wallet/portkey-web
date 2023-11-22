import { useCallback } from 'react';
import { IGuardianIdentifierInfo } from '../../types';
import { errorTip, handleErrorMessage, setLoading } from '../../../utils';
import { usePortkey } from '../../context';
import { getGuardianList } from '../../SignStep/utils/getGuardians';
import { BaseGuardianItem, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../../types';
import useVerifier from '../../../hooks/useVerifier';
import { GuardiansApproved, OperationTypeEnum, VerifierItem } from '@portkey/services';
import useSendCode from './useSendCode';

interface Props {
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
}

const socialTypeList = ['Apple', 'Google'];

export enum NextStepType {
  Step2OfSkipGuardianApprove = 'Step2OfSkipGuardianApprove',
  SetPinAndAddManager = 'SetPinAndAddManager',
}

const useSignInHandler = ({ isErrorTip = true, onError }: Props) => {
  const [{ sandboxId, chainType }] = usePortkey();
  const { verifySocialToken } = useVerifier();
  const sendCodeConfirm = useSendCode();

  const getGuardians = useCallback(
    async (guardianIdentifierInfo: IGuardianIdentifierInfo) => {
      try {
        const guardianAccounts = await getGuardianList({
          originChainId: guardianIdentifierInfo.chainId,
          identifier: guardianIdentifierInfo.identifier,
          sandboxId,
          chainType,
        });

        const currentGuardiansList = guardianAccounts.map((baseGuardian: BaseGuardianItem) => {
          if (
            guardianIdentifierInfo.authenticationInfo &&
            guardianIdentifierInfo.identifier === baseGuardian.identifier &&
            guardianIdentifierInfo.accountType === baseGuardian.guardianType
          )
            baseGuardian.accessToken =
              guardianIdentifierInfo.authenticationInfo?.googleAccessToken ||
              guardianIdentifierInfo.authenticationInfo?.appleIdToken;

          return Object.assign({}, baseGuardian);
        });
        return currentGuardiansList;
      } catch (error) {
        errorTip(
          {
            errorFields: 'getGuardians',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onError,
        );
      }
    },
    [chainType, isErrorTip, onError, sandboxId],
  );

  const approveAppleAndGoogle = useCallback(
    async (guardianIdentifierInfo: IGuardianIdentifierInfo, guardian: BaseGuardianItem) => {
      const verifier = guardian.verifier as VerifierItem;
      const result = await verifySocialToken({
        accountType: guardian.guardianType,
        token: guardian.accessToken,
        guardianIdentifier: guardian.identifier || '',
        verifier,
        chainId: guardianIdentifierInfo.chainId,
        operationType: OperationTypeEnum.communityRecovery,
      });
      if (!result.signature || !result.verificationDoc) throw 'Verify social login error';
      const approvedItem = {
        type: guardian.guardianType,
        identifier: guardian.identifier || guardian.identifierHash || '',
        verifierId: guardian.verifier?.id || '',
        verificationDoc: result.verificationDoc,
        signature: result.verificationDoc,
        status: VerifyStatus.Verified,
      };

      return approvedItem;
    },
    [verifySocialToken],
  );

  const toGuardianApprove = useCallback(
    async (guardianIdentifierInfo: IGuardianIdentifierInfo, guardianList: UserGuardianStatus[]) => {
      setLoading(false);

      return {
        nextStep: NextStepType.Step2OfSkipGuardianApprove,
        value: {
          guardianIdentifierInfo,
          guardianList,
        },
      };
    },
    [],
  );

  const signInHandler: (guardianIdentifierInfo: IGuardianIdentifierInfo) => Promise<
    | {
        nextStep: NextStepType;
        value: {
          guardianIdentifierInfo: IGuardianIdentifierInfo;
          guardianList: UserGuardianStatus[];
          approvedList?: GuardiansApproved[];
        };
      }
    | undefined
  > = useCallback(
    async (guardianIdentifierInfo: IGuardianIdentifierInfo) => {
      setLoading(true);
      const guardianList = await getGuardians(guardianIdentifierInfo);

      if (!guardianList) {
        setLoading(false);
        throw 'Get GuardianList error';
      }
      if (guardianList.length !== 1) {
        try {
          const guardianIndex = guardianList.findIndex(
            (item) =>
              item.guardianIdentifier === guardianIdentifierInfo.identifier &&
              item.guardianType === guardianIdentifierInfo.accountType,
          );
          const guardian = guardianList[guardianIndex];

          if (!guardian) throw 'No match';
          const accountType = guardian.guardianType;
          if (!socialTypeList.includes(accountType)) throw 'No match for Apple or Google';
          const approvedItem = await approveAppleAndGoogle(guardianIdentifierInfo, guardian);
          guardianList[guardianIndex] = {
            ...guardian,
            ...approvedItem,
          };
          return {
            nextStep: NextStepType.Step2OfSkipGuardianApprove,
            value: {
              guardianIdentifierInfo,
              approvedList: [approvedItem],
              guardianList,
            },
          };
        } catch (error) {
          //
          console.log(error);
        }

        return toGuardianApprove(guardianIdentifierInfo, guardianList);
      }
      // guardianList.length === 1
      const guardian = guardianList[0];
      console.log(guardian, 'guardian=getGuardians');
      const accountType = guardian.guardianType;
      // Apple and Google approve;
      if (socialTypeList.includes(accountType)) {
        try {
          const approvedItem = await approveAppleAndGoogle(guardianIdentifierInfo, guardian);
          return {
            nextStep: NextStepType.SetPinAndAddManager,
            value: {
              guardianIdentifierInfo,
              approvedList: [approvedItem],
              guardianList: [
                {
                  ...guardian,
                  ...approvedItem,
                },
              ],
            },
          };
        } catch (error) {
          return toGuardianApprove(guardianIdentifierInfo, guardianList);
        } finally {
          setLoading(false);
        }
      } else {
        if (!guardian.verifier) throw 'guardian verifier is missing';
        // Send verify code
        setLoading(false);

        const verifyCodeInfo = await sendCodeConfirm({
          verifier: guardian.verifier,
          accountType,
          identifierInfo: guardianIdentifierInfo,
        });
        if (!verifyCodeInfo) return;

        return toGuardianApprove(guardianIdentifierInfo, [
          {
            ...guardian,
            status: VerifyStatus.Verifying,
            verifierInfo: {
              sessionId: verifyCodeInfo.verifierSessionId,
            },
          },
        ]);
      }
    },
    [approveAppleAndGoogle, getGuardians, sendCodeConfirm, toGuardianApprove],
  );
  return signInHandler;
};

export default useSignInHandler;
