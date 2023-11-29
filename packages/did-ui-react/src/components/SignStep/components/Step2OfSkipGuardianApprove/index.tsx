import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { memo, useRef } from 'react';
import BackHeader from '../../../BackHeader';
import GuardianApproval, { IGuardianApprovalInstance } from '../../../GuardianApproval/index.component';
import { OnErrorFunc, UserGuardianStatus } from '../../../../types';
import { IGuardianIdentifierInfo } from '../../../types';
import { useEffectOnce } from 'react-use';

interface Step2OfSkipGuardianApproveProps {
  isErrorTip?: boolean;
  guardianList?: UserGuardianStatus[];
  guardianIdentifierInfo: IGuardianIdentifierInfo;
  onFinish?(guardianList: GuardiansApproved[]): Promise<void>;
  onCancel?(): void;
  onError?: OnErrorFunc;
  onGuardianListChange?(guardianList: UserGuardianStatus[]): void;
}

function Step2OfSkipGuardianApprove({
  isErrorTip = true,
  guardianList,
  guardianIdentifierInfo,
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

  return (
    <div className="step-page-wrapper step2-sign-in-wrapper">
      <GuardianApproval
        ref={ref}
        operationType={OperationTypeEnum.communityRecovery}
        originChainId={guardianIdentifierInfo.chainId}
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

export default memo(Step2OfSkipGuardianApprove);
