import { useMemo } from 'react';
import AreaCodeModal from './AreaCodeModal';
import { ICountryItem } from '../../types';
import AreaCodeDrawer from './AreaCodeDrawer';

export interface AreaCodeProps {
  open?: boolean;
  type?: 'modal' | 'drawer';
  value?: ICountryItem['iso'];
  areaList?: ICountryItem[];
  onCancel?: () => void;
  onChange?: (item: ICountryItem) => void;
}

export default function AreaCode(props: AreaCodeProps) {
  const render = useMemo(() => {
    const type = props.type;
    switch (type) {
      case 'drawer':
        return <AreaCodeDrawer {...props} />;
      case 'modal':
      default:
        return <AreaCodeModal {...props} />;
    }
  }, [props]);
  return render;
}
