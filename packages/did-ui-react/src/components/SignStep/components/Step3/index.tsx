import { Button } from 'antd';
import CommonModal from '../../../CommonModal';
import { memo, useCallback, useMemo, useState } from 'react';
import { OnErrorFunc } from '../../../../types';
import SetPinAndAddManagerCom, { SetPinAndAddManagerProps } from '../../../SetPinAndAddManager/index.component';
import { AddManagerType, IGuardianIdentifierInfo } from '../../../types';
import './index.less';

interface Step3Props extends Omit<SetPinAndAddManagerProps, 'type' | 'accountType' | 'chainId' | 'guardianIdentifier'> {
  guardianIdentifierInfo?: IGuardianIdentifierInfo;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onCancel?: (type?: AddManagerType) => void;
}

// type PartialOption<T, K extends keyof T> = Omit<T, K> & {
//   [K in keyof T]?: T[K];
// };

function Step3({
  guardianIdentifierInfo,
  guardianApprovedList = [],
  isErrorTip,
  onFinish,
  onCancel,
  onError,
  onCreatePending,
  onlyGetPin,
  ...props
}: Step3Props) {
  const [returnOpen, setReturnOpen] = useState<boolean>(false);

  const type = useMemo(
    () => (guardianIdentifierInfo?.isLoginGuardian ? 'recovery' : 'register'),
    [guardianIdentifierInfo?.isLoginGuardian],
  );

  const onBackHandler = useCallback(() => {
    if (onlyGetPin) {
      onCancel?.('addManager');
      return;
    }
    if (type === 'register') {
      setReturnOpen(true);
    } else {
      onCancel?.(type);
    }
  }, [onCancel, onlyGetPin, type]);

  return (
    <div className="step-page-wrapper">
      {guardianIdentifierInfo ? (
        <SetPinAndAddManagerCom
          {...props}
          onBack={onBackHandler}
          className="step-set-pin"
          chainId={guardianIdentifierInfo.chainId}
          accountType={guardianIdentifierInfo.accountType}
          guardianIdentifier={guardianIdentifierInfo.identifier}
          type={type}
          guardianApprovedList={guardianApprovedList}
          isErrorTip={isErrorTip}
          onlyGetPin={onlyGetPin}
          onFinish={onFinish}
          onError={onError}
          onCreatePending={onCreatePending}
        />
      ) : (
        'Missing `guardianIdentifierInfo`, please check params'
      )}
      <CommonModal
        type="modal"
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
