import { DrawerProps, ModalProps } from 'antd';
import SelectList from '../SelectList';
import { FiatType, RampDrawerType } from '../../../../types';
import CommonBaseModal from '../../../CommonBaseModal';
import { MAINNET } from '../../../../constants/network';
import './index.less';

interface CustomSelectProps extends DrawerProps {
  onChange?: (v: any) => void;
  onClose: () => void;
  searchPlaceHolder?: string;
  fiatList: FiatType[];
  drawerType: RampDrawerType;
  getContainer?: ModalProps['getContainer'];
}

export default function CustomModal({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  fiatList,
  drawerType,
  ...props
}: CustomSelectProps) {
  return (
    <CommonBaseModal
      {...props}
      onClose={onClose}
      destroyOnClose
      wrapClassName="custom-prompt-modal"
      className="ramp-modal">
      <SelectList
        fiatList={fiatList}
        drawerType={drawerType}
        title={title}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
        networkType={MAINNET}
      />
    </CommonBaseModal>
  );
}
