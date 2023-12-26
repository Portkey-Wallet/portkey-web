import type { ChainId, ChainType } from '@portkey/types';
import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { memo, useState, useCallback } from 'react';
import { errorTip, handleErrorMessage, setLoading } from '../../../../utils';
import BackHeader from '../../../BackHeader';
import GuardianApproval from '../../../GuardianApproval/index.component';
import { BaseGuardianItem, OnErrorFunc, UserGuardianStatus, VerifyStatus } from '../../../../types';
import { IGuardianIdentifierInfo } from '../../../types';
import './index.less';
import { useEffectOnce } from 'react-use';
import { usePortkey } from '../../../context';
import { getGuardianList } from '../../utils/getGuardians';

interface Step2OfLoginProps {
  chainId?: ChainId;
  chainType?: ChainType;
  isErrorTip?: boolean;
  guardianList?: UserGuardianStatus[];
  approvedList?: GuardiansApproved[];
  guardianIdentifierInfo: IGuardianIdentifierInfo;
  networkType?: string;
  onFinish?(guardianList: GuardiansApproved[]): Promise<void>;
  onCancel?(): void;
  onError?: OnErrorFunc;
  onGuardianListChange?(guardianList: UserGuardianStatus[]): void;
}

function Step2OfLogin({
  chainType,
  isErrorTip = true,
  approvedList,
  guardianList: defaultGuardianList,
  networkType = '',
  guardianIdentifierInfo,
  onFinish,
  onCancel,
  onError,
  onGuardianListChange,
}: Step2OfLoginProps) {
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[] | undefined>(defaultGuardianList);
  const [{ sandboxId }] = usePortkey();

  const _getGuardianList = useCallback(async () => {
    try {
      setLoading(true);

      const guardianAccounts = await getGuardianList({
        originChainId: guardianIdentifierInfo.chainId,
        identifier: guardianIdentifierInfo.identifier,
        sandboxId,
        chainType,
      });

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

      const currentGuardiansList = guardianAccounts.map((baseGuardian: BaseGuardianItem) => {
        const key = baseGuardian.key;

        if (
          guardianIdentifierInfo.authenticationInfo &&
          guardianIdentifierInfo.identifier === baseGuardian.identifier &&
          guardianIdentifierInfo.accountType === baseGuardian.guardianType
        )
          baseGuardian.accessToken = guardianIdentifierInfo.authenticationInfo?.authToken;
        const temGuardian = (guardianMap[key] ? guardianMap[key] : {}) as UserGuardianStatus;
        if (approvedMap[key] && temGuardian) {
          const approvedItem = approvedMap[key];
          temGuardian.status = VerifyStatus.Verified;
          temGuardian.verificationDoc = approvedItem.verificationDoc;
          temGuardian.signature = approvedItem.signature;
        }
        return Object.assign(temGuardian, baseGuardian);
      });
      console.log(currentGuardiansList, 'currentGuardiansList==');
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
  }, [approvedList, chainType, guardianIdentifierInfo, guardianList, isErrorTip, onError, sandboxId]);

  useEffectOnce(() => {
    _getGuardianList();
  });

  return (
    <div className="step-page-wrapper step2-sign-in-wrapper">
      <GuardianApproval
        operationType={OperationTypeEnum.communityRecovery}
        originChainId={guardianIdentifierInfo.chainId}
        header={<BackHeader onBack={onCancel} />}
        guardianList={guardianList}
        networkType={networkType}
        isErrorTip={isErrorTip}
        onConfirm={onFinish}
        onError={onError}
        onGuardianListChange={onGuardianListChange}
      />
    </div>
  );
}

export default memo(Step2OfLogin);
