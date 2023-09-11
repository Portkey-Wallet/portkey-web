import { DrawerProps } from 'antd';
import SelectList from '../SelectList';
import { FiatType, RampDrawerType } from '../../../../types';
import CommonBaseModal, { ICommonBaseModalProps } from '../../../CommonBaseModal';
import './index.less';

interface CustomSelectProps extends DrawerProps {
  onChange?: (v: any) => void;
  onClose: () => void;
  searchPlaceHolder?: string;
  fiatList: FiatType[];
  drawerType: RampDrawerType;
  getContainer?: ICommonBaseModalProps['getContainer'];
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
    <CommonBaseModal {...props} onClose={onClose} destroyOnClose className="ramp-modal">
      <SelectList
        fiatList={fiatList}
        drawerType={drawerType}
        title={title}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
        networkType={'MAIN'}
      />
    </CommonBaseModal>
  );
}
