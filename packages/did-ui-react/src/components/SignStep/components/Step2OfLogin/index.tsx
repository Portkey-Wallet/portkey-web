import type { ChainId, ChainType } from '@portkey/types';
import { VerifierItem } from '@portkey/did';
import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { memo, useState, useCallback } from 'react';
import { did, errorTip, handleErrorMessage, setLoading } from '../../../../utils';
import BackHeader from '../../../BackHeader';
import GuardianApproval from '../../../GuardianApproval/index.component';
import { BaseGuardianItem, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../../../types';
import { getVerifierList } from '../../../../utils/sandboxUtil/getVerifierList';
import { IGuardianIdentifierInfo } from '../../../types';
import './index.less';
import { useEffectOnce } from 'react-use';
import { getChainInfo } from '../../../../hooks/useChainInfo';
import { usePortkey } from '../../../context';

interface Step2OfLoginProps {
  chainId?: ChainId;
  chainType?: ChainType;
  isErrorTip?: boolean;
  guardianList?: UserGuardianStatus[];
  approvedList?: GuardiansApproved[];
  guardianIdentifierInfo: IGuardianIdentifierInfo;
  onFinish?(guardianList: GuardiansApproved[]): void;
  onCancel?(): void;
  onError?: OnErrorFunc;
  onGuardianListChange?(guardianList: UserGuardianStatus[]): void;
}

function Step2OfLogin({
  chainType,
  chainId,
  isErrorTip = true,
  approvedList,
  guardianList: defaultGuardianList,
  guardianIdentifierInfo,
  onFinish,
  onCancel,
  onError,
  onGuardianListChange,
}: Step2OfLoginProps) {
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[] | undefined>(defaultGuardianList);
  const [{ sandboxId }] = usePortkey();

  const getVerifierListHandler = useCallback(async () => {
    const chainInfo = await getChainInfo(chainId);
    if (!chainInfo) return;

    const list = await getVerifierList({
      sandboxId,
      chainId: guardianIdentifierInfo.chainId,
      rpcUrl: chainInfo.endPoint,
      chainType: chainType ?? 'aelf',
      address: chainInfo.caContractAddress,
    });
    return list;
  }, [chainId, chainType, guardianIdentifierInfo.chainId, sandboxId]);

  const getGuardianList = useCallback(async () => {
    try {
      setLoading(true);
      const verifierList = await getVerifierListHandler();
      if (!verifierList) return;
      const verifierMap: { [x: string]: VerifierItem } = {};
      verifierList?.forEach((item) => {
        verifierMap[item.id] = item;
      });

      const payload = await did.getHolderInfo({
        loginGuardianIdentifier: guardianIdentifierInfo.identifier.replaceAll(/\s/g, ''),
        chainId: guardianIdentifierInfo.chainId,
      });

      const { guardians } = payload?.guardianList ?? { guardians: [] };
      const guardianAccounts = [...guardians];
      const guardianMap: { [x: string]: UserGuardianStatus } = {};
      if (guardianList) {
        guardianList.forEach((guardian) => {
          const key = `${guardian.identifier || guardian.identifierHash}&${guardian.verifier?.id}`;
          guardianMap[key] = guardian;
        });
      }
      const approvedMap = {} as { [x: string]: GuardiansApproved };
      if (approvedList) {
        approvedList.forEach((item) => {
          approvedMap[`${item.identifier}&${item.verifierId}`] = item;
        });
      }

      const currentGuardiansList = guardianAccounts.map((_guardianAccount) => {
        const key = `${_guardianAccount.guardianIdentifier}&${_guardianAccount.verifierId}`;

        const guardianAccount = _guardianAccount.guardianIdentifier || _guardianAccount.identifierHash;
        const verifier = verifierMap?.[_guardianAccount.verifierId];

        const baseGuardian: BaseGuardianItem = {
          ..._guardianAccount,
          key,
          verifier,
          identifier: guardianAccount,
          guardianType: _guardianAccount.type,
        };
        if (
          guardianIdentifierInfo.authenticationInfo &&
          guardianIdentifierInfo.identifier === guardianAccount &&
          guardianIdentifierInfo.accountType === baseGuardian.guardianType
        )
          baseGuardian.accessToken =
            guardianIdentifierInfo.authenticationInfo?.googleAccessToken ||
            guardianIdentifierInfo.authenticationInfo?.appleIdToken;
        const temGuardian = (guardianMap[key] ? guardianMap[key] : {}) as UserGuardianStatus;
        if (approvedMap[key] && temGuardian) {
          const approvedItem = approvedMap[key];
          temGuardian.status = VerifyStatus.Verified;
          temGuardian.verificationDoc = approvedItem.verificationDoc;
          temGuardian.signature = approvedItem.signature;
        }
        return Object.assign(temGuardian, baseGuardian);
      });

      setGuardianList(currentGuardiansList);
    } catch (error) {
      errorTip(
        {
          errorFields: 'GuardianApproval',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [approvedList, getVerifierListHandler, guardianIdentifierInfo, guardianList, isErrorTip, onError]);

  useEffectOnce(() => {
    getGuardianList();
  });

  return (
    <div className="step-page-wrapper step2-sign-in-wrapper">
      <GuardianApproval
        operationType={OperationTypeEnum.communityRecovery}
        chainId={guardianIdentifierInfo.chainId}
        header={<BackHeader onBack={onCancel} />}
        guardianList={guardianList}
        isErrorTip={isErrorTip}
        onConfirm={onFinish}
        onError={onError}
        onGuardianListChange={onGuardianListChange}
      />
    </div>
  );
}

export default memo(Step2OfLogin);
