import { ModalProps } from 'antd';
import './index.less';
import SelectCryptoList, { ISelectCryptoListProps } from '../SelectCryptoList';
import CommonModal from '../../../../CommonModal';

// type TSelectCryptoDrawerProps = ISelectCryptoListProps & DrawerProps;
type TSelectCryptoModalProps = ISelectCryptoListProps & ModalProps;
type TSelectCryptoListWrapProps = TSelectCryptoModalProps;

export default function SelectCryptoListWrap({
  onChange,
  onClose,
  networkType,
  title,
  searchPlaceHolder,
  supportList,
  ...props
}: TSelectCryptoListWrapProps) {
  return (
    <CommonModal {...props} onClose={onClose} destroyOnClose className="ramp-crypto-modal">
      <SelectCryptoList
        networkType={networkType}
        title={title}
        searchPlaceHolder={searchPlaceHolder}
        supportList={supportList}
        onClose={onClose}
        onChange={onChange}
      />
    </CommonModal>
  );
}
