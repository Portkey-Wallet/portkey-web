import clsx from 'clsx';
import BackHeaderForPage from '../../../../../BackHeaderForPage';
import MaxTokenShortcut from '../../../../../MaxTokenShortcut';
import AutoWidthInput from '../../../../../AutoWidthInput';
import CommonButton from '../../../../../CommonButton';
import GuardianApprovalModal from '../../../../../GuardianApprovalModal';
import CommonModal from '../../../../../CommonModal';
import { getOperationDetails } from '../../../../../utils/operation.util';
import { OperationTypeEnum } from '@portkey/services';
import CommonInput from '../../../../../CommonInput';
import CustomSvg from '../../../../../CustomSvg';
import { IRampCryptoItem, IRampFiatItem } from '@portkey/ramp';
import { ErrorType } from '../../../../types';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { NetworkType } from '../../../../../../types';
import { ChainId } from '@portkey/types';
import { timesDecimals } from '@etransfer/utils';
import PortkeyStyleProvider from '../../../../../PortkeyStyleProvider';
export interface IRampSellPureCompProps {
  className?: string;
  sandboxId?: string;
  selectedCrypto: IRampCryptoItem;
  currency: {
    crypto?: IRampCryptoItem;
    fiat?: IRampFiatItem;
  };
  maxAmount: string;
  amount: string;
  amountError: ErrorType;
  textInputRef: React.RefObject<HTMLInputElement>;
  receiveAmountText: string;
  buttonLoading: boolean;
  isAllowAmount: boolean;
  approvalVisible: boolean;
  networkType: NetworkType;
  caHash: string;
  originChainId: ChainId;
  openFiatModal: boolean;
  filteredList: IRampFiatItem[];
  selectedItem: IRampFiatItem;
  onBack?: () => void;
  onChangeCurrency: () => void;
  onMaxPress: () => void;
  onAmountInput: (text: string) => void;
  handleNext: () => Promise<any>;
  setApprovalVisible: Dispatch<SetStateAction<boolean>>;
  onApprovalSuccess: (approveList: any[]) => void;
  setOpenFiatModal: Dispatch<SetStateAction<boolean>>;
  onSearchInputChange: (text: string) => void;
  onFiatChange: (_fiat: IRampFiatItem) => void;
}

export default function RampSellPureComponent(props: IRampSellPureCompProps) {
  const {
    className,
    sandboxId = 'sandbox',
    selectedCrypto,
    currency,
    maxAmount,
    amount,
    amountError,
    textInputRef,
    receiveAmountText,
    buttonLoading,
    isAllowAmount,
    approvalVisible,
    networkType,
    caHash,
    originChainId,
    openFiatModal,
    filteredList,
    selectedItem,
    onBack,
    onMaxPress,
    onAmountInput,
    onChangeCurrency,
    handleNext,
    setApprovalVisible,
    onApprovalSuccess,
    setOpenFiatModal,
    onSearchInputChange,
    onFiatChange,
  } = props;
  return (
    <PortkeyStyleProvider>
      <div className={clsx(['portkey-ui-ramp-frame portkey-ui-flex-column', className])} id="portkey-ui-ramp">
        <BackHeaderForPage
          title={`Sell ${selectedCrypto?.symbol}`}
          leftCallBack={() => {
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
        <div className="portkey-ui-ramp-content portkey-ui-flex-column-center ramp-sell">
          <div className="ramp-sell-pageWrap">
            <MaxTokenShortcut tokenInfo={currency.crypto} maxAmount={maxAmount} onMaxPress={onMaxPress} />
            {/* Fiat Input Section */}
            <div className="fiatWrap">
              {/* Amount Input */}
              <AutoWidthInput
                placeholder="0"
                onAmountInput={onAmountInput}
                amount={amount}
                amountError={amountError}
                textInputRef={textInputRef}
              />
              {/* Fiat Symbol */}
              <div
                className="fiatText"
                onClick={() => {
                  if (textInputRef.current) {
                    textInputRef.current.focus();
                  }
                }}>
                {currency.crypto?.symbol}
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
            disabled={!isAllowAmount || amountError.isError}
            onClick={handleNext}>
            Next
          </CommonButton>
        </div>
        <GuardianApprovalModal
          sandboxId={sandboxId}
          open={approvalVisible}
          networkType={networkType}
          caHash={caHash || ''}
          originChainId={originChainId}
          targetChainId={selectedCrypto.chainId}
          operationType={OperationTypeEnum.transferApprove}
          operationDetails={getOperationDetails(OperationTypeEnum.transferApprove, {
            symbol: selectedCrypto.symbol,
            amount: timesDecimals(amount, selectedCrypto.decimals).toNumber(),
            toAddress: selectedCrypto.address,
          })}
          officialWebsiteShow={{ amount: amount, symbol: selectedCrypto.symbol }}
          isErrorTip={true}
          // sandboxId={sandboxId}
          onClose={() => setApprovalVisible(false)}
          onBack={() => setApprovalVisible(false)}
          onApprovalSuccess={onApprovalSuccess}
        />
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
