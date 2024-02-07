import { DrawerProps, ModalProps } from 'antd';
import './index.less';
import SelectCryptoList, { ISelectCryptoListProps } from '../SelectCryptoList';
import CommonModal from '../../../../CommonModal';

type TSelectCryptoDrawerProps = ISelectCryptoListProps & DrawerProps;

type TSelectCryptoModalProps = ISelectCryptoListProps & ModalProps;

type TSelectCryptoListWrapProps = TSelectCryptoDrawerProps | TSelectCryptoModalProps;

export default function SelectCryptoListWrap({
  onChange,
  onClose,
  networkType,
  title,
  searchPlaceHolder,
  supportList,
}: TSelectCryptoListWrapProps) {
  return (
    <CommonModal onClose={onClose} destroyOnClose className="ramp-crypto-modal">
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
