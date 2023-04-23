import { Button } from 'antd';
import BackHeader from '../../../BackHeader';
import CommonModal from '../../../CommonModal';
import { memo, useCallback, useState } from 'react';
import { OnErrorFunc } from '../../../../types';
import SetPinAndAddManagerCom, { SetPinAndAddManagerProps } from '../../../SetPinAndAddManager/index.component';
import { AddManagerType, SignInSuccess } from '../../../types';
import './index.less';

interface Step3Props extends Omit<SetPinAndAddManagerProps, 'chainId' | 'guardianIdentifier'> {
  guardianIdentifierInfo?: SignInSuccess;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onCancel?: (type?: AddManagerType) => void;
}

type PartialOption<T, K extends keyof T> = Omit<T, K> & {
  [K in keyof T]?: T[K];
};

function Step3({
  guardianIdentifierInfo,
  type = 'register',
  guardianApprovedList = [],
  isErrorTip,
  onFinish,
  onCancel,
  onError,
  onCreatePending,
  ...props
}: PartialOption<Step3Props, 'type'>) {
  const [returnOpen, setReturnOpen] = useState<boolean>(false);

  const onBackHandler = useCallback(() => {
    if (type === 'register') {
      setReturnOpen(true);
    } else {
      onCancel?.(type);
    }
  }, [onCancel, type]);

  return (
    <div className="step-page-wrapper">
      <BackHeader onBack={onBackHandler} />
      <SetPinAndAddManagerCom
        {...props}
        className="step-set-pin content-padding"
        chainId={guardianIdentifierInfo?.chainId}
        accountType={guardianIdentifierInfo?.accountType}
        guardianIdentifier={guardianIdentifierInfo?.identifier}
        type={type}
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
          <Button type="primary" onClick={() => onCancel?.('register')}>
            Yes
          </Button>
        </div>
      </CommonModal>
    </div>
  );
}

export default memo(Step3);
