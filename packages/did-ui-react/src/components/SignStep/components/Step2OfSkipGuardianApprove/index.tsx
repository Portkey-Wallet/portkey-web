import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { memo, useMemo, useRef } from 'react';
import BackHeader from '../../../BackHeader';
import GuardianApproval, { IGuardianApprovalInstance } from '../../../GuardianApproval/index.component';
import { NetworkType, OnErrorFunc, UserGuardianStatus } from '../../../../types';
import { IGuardianIdentifierInfo } from '../../../types';
import { useEffectOnce } from 'react-use';
import { getOperationDetails } from '../../../utils/operation.util';

interface Step2OfSkipGuardianApproveProps {
  isErrorTip?: boolean;
  guardianList?: UserGuardianStatus[];
  guardianIdentifierInfo: IGuardianIdentifierInfo;
  networkType: NetworkType;
  onFinish?(guardianList: GuardiansApproved[]): Promise<void>;
  onCancel?(): void;
  onError?: OnErrorFunc;
  onGuardianListChange?(guardianList: UserGuardianStatus[]): void;
}

function Step2OfSkipGuardianApprove({
  isErrorTip = true,
  guardianList,
  guardianIdentifierInfo,
  networkType,
  onFinish,
  onCancel,
  onError,
  onGuardianListChange,
}: Step2OfSkipGuardianApproveProps) {
  const ref = useRef<IGuardianApprovalInstance>();

  useEffectOnce(() => {
    console.log(guardianList, 'guardian==Step2OfSkipGuardianApprove');
    const guardian = guardianList?.[0];
    if (guardianList?.length === 1 && guardian && guardian.verifierInfo?.sessionId) {
      guardian.isInitStatus = true;
      ref.current?.setVerifyAccountIndex(0);
    }
  });

  const operationDetails = useMemo(() => getOperationDetails(OperationTypeEnum.communityRecovery), []);

  return (
    <div className="step-page-wrapper step2-sign-in-wrapper">
      <GuardianApproval
        ref={ref}
        operationDetails={operationDetails}
        operationType={OperationTypeEnum.communityRecovery}
        originChainId={guardianIdentifierInfo.chainId}
        header={<BackHeader onBack={onCancel} />}
        guardianList={guardianList}
        isErrorTip={isErrorTip}
        networkType={networkType}
        onConfirm={onFinish}
        onError={onError}
        onGuardianListChange={onGuardianListChange}
      />
    </div>
  );
}

export default memo(Step2OfSkipGuardianApprove);
