import { useMemo } from 'react';
import { FiatType, PartialFiatType, RampDrawerType } from '../../../../types';
import CustomDrawer from '../CustomDrawer';
import CustomModal from '../CustomModal';

interface ISuffixSelectProps {
  fiatList: FiatType[];
  drawerType: RampDrawerType;
  open: boolean;
  isModal: Boolean;
  onClose: () => void;
  onSelect: (v: PartialFiatType) => void;
}

const SelectCrypto = 'Select Crypto';
const SelectCurrency = 'Select Currency';
const SearchCrypto = 'Search crypto';
const SearchCurrency = 'Search currency';

export default function SuffixSelect({
  fiatList,
  drawerType,
  open,
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
      getContainer={'#portkey-ui-ramp'}
      open={open}
      fiatList={fiatList}
      drawerType={drawerType}
      title={title}
      searchPlaceHolder={searchPlaceHolder}
      onClose={onClose}
      onChange={onSelect}
    />
  ) : (
    <CustomDrawer
      getContainer={'#portkey-ui-ramp'}
      open={open}
      fiatList={fiatList}
      drawerType={drawerType}
      title={title}
      searchPlaceHolder={searchPlaceHolder}
      height="528"
      maskClosable={true}
      placement="bottom"
      onClose={onClose}
      onChange={onSelect}
    />
  );
}
