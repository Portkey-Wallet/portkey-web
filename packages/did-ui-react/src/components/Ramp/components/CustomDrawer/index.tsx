import { DrawerProps } from 'antd';
import BaseDrawer from '../../../BaseDrawer';
import SelectList from '../SelectList';
import './index.less';
import { RampDrawerType, RampTypeEnum } from '../../../../types';

interface CustomSelectProps extends DrawerProps {
  onChange?: (v: any) => void;
  onClose?: () => void;
  searchPlaceHolder?: string;
  drawerType: RampDrawerType;
  side: RampTypeEnum;
}

export default function CustomDrawer({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  drawerType,
  side,
  ...props
}: CustomSelectProps) {
  return (
    <BaseDrawer {...props} onClose={onClose} className="custom-drawer" destroyOnClose>
      <SelectList
        drawerType={drawerType}
        title={title}
        side={side}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
      />
    </BaseDrawer>
  );
}
