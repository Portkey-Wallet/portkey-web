import { DrawerProps } from 'antd';
import SelectList from '../SelectList';
import { RampDrawerType, RampTypeEnum } from '../../../../types';
import CustomPromptModal, { ICustomTokenModalProps } from '../../../CustomPromptModal';
import './index.less';

interface CustomSelectProps extends DrawerProps {
  onChange?: (v: any) => void;
  onClose: () => void;
  searchPlaceHolder?: string;
  drawerType: RampDrawerType;
  side: RampTypeEnum;
  getContainer?: ICustomTokenModalProps['getContainer'];
}

export default function CustomModal({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  drawerType,
  side,
  ...props
}: CustomSelectProps) {
  return (
    <CustomPromptModal {...props} onClose={onClose} destroyOnClose className="buy-modal">
      <SelectList
        drawerType={drawerType}
        title={title}
        side={side}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
      />
    </CustomPromptModal>
  );
}
