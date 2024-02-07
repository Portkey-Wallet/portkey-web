import { DrawerProps, ModalProps } from 'antd';
import './index.less';
import SelectFiatList, { ISelectFiatListProps } from '../SelectFiatList';
import CommonModal from '../../../../CommonModal';

type TSelectFiatDrawerProps = ISelectFiatListProps & DrawerProps;
type TSelectFiatModalProps = ISelectFiatListProps & ModalProps;
type TSelectFiatListWrapProps = TSelectFiatDrawerProps | TSelectFiatModalProps;

export default function SelectFiatListWrap({
  supportList,
  title,
  searchPlaceHolder,
  defaultCrypto,
  onClose,
  onChange,
}: TSelectFiatListWrapProps) {
  return (
    <CommonModal onClose={onClose} destroyOnClose className="ramp-fiat-modal">
      <SelectFiatList
        supportList={supportList}
        title={title}
        searchPlaceHolder={searchPlaceHolder}
        defaultCrypto={defaultCrypto}
        onClose={onClose}
        onChange={onChange}
      />
    </CommonModal>
  );
}
