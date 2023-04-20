import { Button } from 'antd';
import BackHeader from '../../../BackHeader';
import CommonModal from '../../../CommonModal';
import { memo, useCallback, useState } from 'react';
import { VerificationType, OnErrorFunc } from '../../../../types';
import SetPinAndAddManagerCom, { SetPinAndAddManagerProps } from '../../../SetPinAndAddManager/index.component';
import { SignInSuccess } from '../../../types';
import './index.less';

interface Step3Props extends Omit<SetPinAndAddManagerProps, 'chainId' | 'guardianIdentifier'> {
  guardianIdentifierInfo: SignInSuccess;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onCancel?: (v?: VerificationType) => void;
}

type PartialOption<T, K extends keyof T> = Omit<T, K> & {
  [K in keyof T]?: T[K];
};

function Step3({
  guardianIdentifierInfo,
  verificationType = VerificationType.register,
  guardianApprovedList = [],
  isErrorTip,
  onFinish,
  onCancel,
  onError,
  onCreatePending,
}: PartialOption<Step3Props, 'verificationType'>) {
  const [returnOpen, setReturnOpen] = useState<boolean>(false);

  const onBackHandler = useCallback(() => {
    if (verificationType === VerificationType.register) {
      setReturnOpen(true);
    } else {
      onCancel?.(verificationType);
    }
  }, [onCancel, verificationType]);

  return (
    <div className="step-page-wrapper">
      <BackHeader onBack={onBackHandler} />
      <SetPinAndAddManagerCom
        className="step-set-pin content-padding"
        chainId={guardianIdentifierInfo.chainId}
        accountType={guardianIdentifierInfo.accountType}
        guardianIdentifier={guardianIdentifierInfo.identifier}
        verificationType={verificationType}
        guardianApprovedList={guardianApprovedList}
        isErrorTip={isErrorTip}
        onFinish={onFinish}
        onError={onError}
        onCreatePending={onCreatePending}
      />
      <CommonModal
        closable={false}
        open={returnOpen}
        className="confirm-return-modal"
        title={'Leave this page?'}
        width={320}
        getContainer={'#set-pin-wrapper'}>
        <p className="modal-content">Are you sure you want to leave this page? All changes will not be saved.</p>
        <div className="btn-wrapper">
          <Button onClick={() => setReturnOpen(false)}>No</Button>
          <Button type="primary" onClick={() => onCancel?.(VerificationType.register)}>
            Yes
          </Button>
        </div>
      </CommonModal>
    </div>
  );
}

export default memo(Step3);
