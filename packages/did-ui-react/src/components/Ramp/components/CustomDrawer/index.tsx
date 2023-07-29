import { DrawerProps } from 'antd';
import BaseDrawer from '../../../BaseDrawer';
import SelectList from '../SelectList';
import './index.less';
import { FiatType, RampDrawerType } from '../../../../types';

interface CustomSelectProps extends DrawerProps {
  onChange?: (v: any) => void;
  onClose?: () => void;
  searchPlaceHolder?: string;
  fiatList: FiatType[];
  drawerType: RampDrawerType;
}

export default function CustomDrawer({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  fiatList,
  drawerType,
  ...props
}: CustomSelectProps) {
  return (
    <BaseDrawer {...props} onClose={onClose} className="custom-drawer" destroyOnClose>
      <SelectList
        drawerType={drawerType}
        fiatList={fiatList}
        title={title}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
        networkType={'MAIN'}
      />
    </BaseDrawer>
  );
}
