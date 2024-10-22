import { useCallback } from 'react';
import { IGuardianIdentifierInfo } from '../../types';
import { errorTip, handleErrorMessage, setLoading } from '../../../utils';
import { usePortkey } from '../../context';
import { getGuardianList } from '../../SignStep/utils/getGuardians';
import { BaseGuardianItem, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../../types';
import useVerifier from '../../../hooks/useVerifier';
import { GuardiansApproved, OperationTypeEnum, VerifierItem } from '@portkey/services';
import useSendCode from './useSendCode';
import { AllSocialLoginList, SocialLoginList } from '../../../constants/guardian';
import { getOperationDetails } from '../../utils/operation.util';

interface Props {
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
}

export enum NextStepType {
  Step2OfSkipGuardianApprove = 'Step2OfSkipGuardianApprove',
  SetPinAndAddManager = 'SetPinAndAddManager',
}

const useSignInHandler = ({ isErrorTip = true, onError }: Props) => {
  const [{ sandboxId, chainType, networkType }] = usePortkey();
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
            baseGuardian.accessToken = guardianIdentifierInfo.authenticationInfo?.authToken;

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

  const approveSocialLogin = useCallback(
    async (guardianIdentifierInfo: IGuardianIdentifierInfo, guardian: BaseGuardianItem) => {
      const verifier = guardian.verifier as VerifierItem;
      const operationType = OperationTypeEnum.communityRecovery;
      const operationDetails = getOperationDetails(operationType);
      const result = await verifySocialToken({
        accountType: guardian.guardianType,
        token: guardian.accessToken,
        idToken: guardianIdentifierInfo.authenticationInfo?.idToken,
        nonce: guardianIdentifierInfo.authenticationInfo?.nonce,
        timestamp: guardianIdentifierInfo.authenticationInfo?.timestamp,
        guardianIdentifier: guardian.identifier || '',
        verifier,
        networkType,
        chainId: guardianIdentifierInfo.chainId,
        operationType,
        operationDetails,
      });
      if (!result?.zkLoginInfo && (!result?.signature || !result?.verificationDoc)) throw 'Verify social login error';
      const approvedItem = {
        type: guardian.guardianType,
        identifier: guardian.identifier || guardian.identifierHash || '',
        verifierId: guardian.verifier?.id || '',
        verificationDoc: result.verificationDoc,
        signature: result.signature,
        zkLoginInfo: result.zkLoginInfo,
      };

      return approvedItem;
    },
    [networkType, verifySocialToken],
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

  const signInHandler: (
    guardianIdentifierInfo: IGuardianIdentifierInfo,
    beforeLastGuardianApprove?: () => void,
  ) => Promise<
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
    async (guardianIdentifierInfo: IGuardianIdentifierInfo, beforeLastGuardianApprove?: () => void) => {
      setLoading(true);
      const guardianList: UserGuardianStatus[] | undefined = await getGuardians(guardianIdentifierInfo);

      if (!guardianList) {
        setLoading(false);
        throw 'Get GuardianList error';
      }
      if (guardianList.length !== 1) {
        const approvedList: GuardiansApproved[] = [];

        try {
          await Promise.all(
            guardianList.map(async (item, index) => {
              if (
                item.guardianIdentifier === guardianIdentifierInfo.identifier &&
                item.guardianType === guardianIdentifierInfo.accountType &&
                item.isLoginGuardian
              ) {
                const guardian = item;

                if (!guardian) throw 'No match';
                const accountType = guardian.guardianType;
                if (!SocialLoginList.includes(accountType)) throw 'No match for Social Login';
                try {
                  const approvedItem = await approveSocialLogin(guardianIdentifierInfo, guardian);
                  approvedList.push(approvedItem);
                  guardianList[index] = {
                    ...guardian,
                    ...approvedItem,
                    status: VerifyStatus.Verified,
                  };
                } catch (error) {
                  return;
                }
              }
            }),
          );

          return {
            nextStep: NextStepType.Step2OfSkipGuardianApprove,
            value: {
              guardianIdentifierInfo,
              approvedList,
              guardianList,
            },
          };
        } catch (error) {
          console.log(error);
        }

        return toGuardianApprove(guardianIdentifierInfo, guardianList);
      }
      // guardianList.length === 1
      const guardian = guardianList[0];

      const accountType = guardian.guardianType;
      // social approve;
      if (AllSocialLoginList.includes(accountType)) {
        try {
          beforeLastGuardianApprove?.();
          const approvedItem = await approveSocialLogin(guardianIdentifierInfo, guardian);
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
          operationType: OperationTypeEnum.communityRecovery,
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
    [approveSocialLogin, getGuardians, sendCodeConfirm, toGuardianApprove],
  );
  return signInHandler;
};

export default useSignInHandler;
