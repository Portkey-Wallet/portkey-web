import clsx from 'clsx';
import { useMemo } from 'react';
import CommonBaseModal from '../CommonBaseModal';
import { PortkeyModalProps } from '../PortkeyModal';
import CustomSvg from '../CustomSvg';
import './styles.less';

export interface CommonModalProps extends PortkeyModalProps {
  className?: string;
  leftCallBack?: () => void;
  onClose?: () => void;
}

export default function CommonModal(props: CommonModalProps) {
  const { leftCallBack, width, title, onClose, children, maskClosable = false } = props;

  const headerUI = useMemo(() => {
    if (leftCallBack) {
      return (
        <div className="portkey-ui-header">
          <div className="portkey-ui-flex-between-center">
            <CustomSvg type="ArrowLeft" onClick={leftCallBack} />
            {onClose ? <CustomSvg type="Close" onClick={onClose} /> : null}
          </div>
          {title ? <div className="header-title">{title}</div> : null}
        </div>
      );
    }
    if (onClose) {
      return <CustomSvg className="portkey-ui-close-icon" type="Close" onClick={onClose} />;
    }
    return null;
  }, [leftCallBack, onClose, title]);
  return (
    <CommonBaseModal
      destroyOnClose
      {...props}
      maskClosable={maskClosable}
      width={width ? width : '400px'}
      className={clsx('portkey-ui-common-modals', props.className)}>
      {headerUI}
      {children}
    </CommonBaseModal>
  );
}
