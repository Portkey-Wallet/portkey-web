import { IRampCryptoItem, IRampFiatItem } from '@portkey/ramp';
import AutoWidthInput from '../../../../../AutoWidthInput';
import BackHeaderForPage from '../../../../../BackHeaderForPage';
import CommonButton from '../../../../../CommonButton';
import CommonInput from '../../../../../CommonInput';
import CommonModal from '../../../../../CommonModal';
import CustomSvg from '../../../../../CustomSvg';
import clsx from 'clsx';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { ErrorType } from '../../../../types';
import './index.less';
import PortkeyStyleProvider from '../../../../../PortkeyStyleProvider';

export interface IRampBuyPureCompProps {
  className?: string;
  selectedCrypto: IRampCryptoItem;
  currency: {
    crypto?: IRampCryptoItem;
    fiat?: IRampFiatItem;
  };
  openFiatModal: boolean;
  amount: string;
  amountError: ErrorType;
  textInputRef: React.RefObject<HTMLInputElement>;
  receiveAmountText: string;
  buttonLoading: boolean;
  isAllowAmount: boolean;
  filteredList: IRampFiatItem[];
  selectedItem: IRampFiatItem;
  init: boolean;
  setOpenFiatModal: Dispatch<SetStateAction<boolean>>;
  onBack?: () => void;
  onChangeCurrency: () => void;
  onAmountInput: (text: string) => void;
  onNext: () => Promise<void>;
  onSearchInputChange: (text: string) => void;
  onFiatChange: (_fiat: IRampFiatItem) => Promise<void>;
}
export default function RampBuyPureComponent(props: IRampBuyPureCompProps) {
  const {
    className,
    selectedCrypto,
    currency,
    openFiatModal,
    amount,
    amountError,
    textInputRef,
    receiveAmountText,
    buttonLoading,
    isAllowAmount,
    filteredList,
    selectedItem,
    init,
    setOpenFiatModal,
    onBack,
    onChangeCurrency,
    onAmountInput,
    onNext,
    onSearchInputChange,
    onFiatChange,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const fiatTextRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState(0);

  useEffect(() => {
    if (!init) {
      return;
    }
    const res = setTimeout(() => {
      if (containerRef.current && fiatTextRef.current) {
        const style = window.getComputedStyle(containerRef.current);
        const fiatTextStyle = window.getComputedStyle(fiatTextRef.current);
        const paddingLeft = parseFloat(style.paddingLeft || '0');
        const paddingRight = parseFloat(style.paddingRight || '0');
        const marginLeft = parseFloat(fiatTextStyle.marginLeft || '0');
        const paddingWidth = paddingLeft + paddingRight;
        console.log(
          containerRef.current.clientWidth,
          paddingLeft,
          paddingRight,
          fiatTextRef.current.clientWidth,
          marginLeft,
        );
        const noPaddingWidth =
          containerRef.current.clientWidth - paddingWidth - fiatTextRef.current.clientWidth - marginLeft;
        setMaxWidth(noPaddingWidth);
      }
    }, 100);
    return () => {
      clearTimeout(res);
    };
  }, [init]);
  return (
    <PortkeyStyleProvider>
      <div className={clsx(['portkey-ui-ramp-frame portkey-ui-flex-column', className])} id="portkey-ui-ramp">
        <BackHeaderForPage
          title={`Buy ${selectedCrypto?.symbol}`}
          leftCallBack={() => {
            // setStep(RampStep.HOME);
            onBack?.();
          }}
          rightElement={
            <div className="portkey-ui-flex-row-center right-element">
              <CustomSvg type={'Change'} className="change-svg" />
              <span className="right-fiat-title">{currency.fiat?.symbol}</span>
            </div>
          }
          rightCallback={onChangeCurrency}
        />
        <div className="portkey-ui-ramp-content portkey-ui-flex-column-center ramp-buy" ref={containerRef}>
          <div className="ramp-buy-pageWrap">
            {/* Fiat Input Section */}
            <div className="fiatWrap">
              {/* Amount Input */}
              <AutoWidthInput
                placeholder="0"
                onAmountInput={onAmountInput}
                amount={amount}
                amountError={amountError}
                textInputRef={textInputRef}
                maxWidth={maxWidth}
              />
              {/* Fiat Symbol */}
              <div
                className="fiatText"
                ref={fiatTextRef}
                onClick={() => {
                  if (textInputRef.current) {
                    textInputRef.current.focus();
                  }
                }}>
                {currency.fiat?.symbol}
              </div>
            </div>
            {/* Receive Amount */}
            <p className="receiveAmount">{receiveAmountText}</p>
            {amountError.isError && <p className="warningText">{amountError.errorMsg}</p>}
          </div>
          <CommonButton
            loading={buttonLoading}
            type="primary"
            block
            // buttonStyle={styles.btnStyle}
            disabled={!isAllowAmount || amountError.isError}
            onClick={onNext}>
            Next
          </CommonButton>
        </div>
        <CommonModal
          className="change-currency-modal-list"
          open={openFiatModal}
          height={582}
          onClose={() => {
            setOpenFiatModal(false);
          }}>
          <div className="change-currency-modal-list-top-wrapper">
            <div className="change-currency-modal-list-title">Change currency</div>
            <CommonInput
              type="search"
              className="change-currency-modal-list-search"
              placeholder="Search"
              onChange={(e) => {
                onSearchInputChange(e.target.value);
              }}
            />
          </div>
          <ul style={{ width: '100%', marginTop: 16, overflowY: 'auto' }}>
            {filteredList?.map((item, index) => (
              <li
                key={index + '_' + item.symbol}
                className="fiat-list-item"
                onClick={() => {
                  // setStep(RampStep.PREVIEW);
                  // setSelectedCrypto(item);
                  onFiatChange(item);
                  setOpenFiatModal(false);
                }}>
                {/* <TokenImageDisplay src={item.icon} symbol={item.symbol} /> */}
                <span className="fiat-name">{`${item.countryName} (${item.symbol})`}</span>
                {selectedItem.countryName === item.countryName && selectedItem.symbol === item.symbol && (
                  <CustomSvg type="CheckCircle" className="fiat-check-circle" />
                )}
              </li>
            ))}
          </ul>
        </CommonModal>
      </div>
    </PortkeyStyleProvider>
  );
}
