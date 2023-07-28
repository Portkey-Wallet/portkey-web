import { useMemo } from 'react';
import { PartialFiatType, RampDrawerType, RampTypeEnum } from '../../../../types';
import CustomDrawer from '../CustomDrawer';
import CustomModal from '../CustomModal';

interface ISuffixSelectProps {
  drawerType: RampDrawerType;
  open: boolean;
  side: RampTypeEnum;
  isModal: Boolean;
  onClose: () => void;
  onSelect: (v: PartialFiatType) => void;
}

const SelectCrypto = 'Select Crypto';
const SelectCurrency = 'Select Currency';
const SearchCrypto = 'Search crypto';
const SearchCurrency = 'Search currency';

export default function SuffixSelect({
  drawerType,
  open,
  side,
  isModal = false,
  onClose,
  onSelect,
}: ISuffixSelectProps) {
  const title = useMemo(() => (drawerType === RampDrawerType.TOKEN ? SelectCrypto : SelectCurrency), [drawerType]);
  const searchPlaceHolder = useMemo(
    () => (drawerType === RampDrawerType.TOKEN ? SearchCrypto : SearchCurrency),
    [drawerType],
  );
  return isModal ? (
    <CustomModal
      open={open}
      drawerType={drawerType}
      title={title}
      side={side}
      searchPlaceHolder={searchPlaceHolder}
      onClose={onClose}
      onChange={onSelect}
    />
  ) : (
    <CustomDrawer
      open={open}
      drawerType={drawerType}
      title={title}
      side={side}
      searchPlaceHolder={searchPlaceHolder}
      height="528"
      maskClosable={true}
      placement="bottom"
      onClose={onClose}
      onChange={onSelect}
    />
  );
}
