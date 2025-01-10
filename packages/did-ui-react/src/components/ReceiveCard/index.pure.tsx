import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { ChainInfo, ReceiveType, TDepositInfo, TReceiveFromNetworkItem } from '@portkey/services';
import { ChainId } from '@portkey/types';
import singleMessage from '../CustomAnt/message';
import Loading from '../Loading';
import PortkeyQRCode from '../PortkeyQRCode';
import AssetModal from '../AssetModal';
import Binance from '../../assets/imgs/binance.png';
import OKX from '../../assets/imgs/okx.png';
import Upbit from '../../assets/imgs/upbit.png';
import BitThumb from '../../assets/imgs/bithumb.png';
import GateIo from '../../assets/imgs/gate_io.png';
import Mexc from '../../assets/imgs/mexc.png';
import Hotcoin from '../../assets/imgs/hotcoin.png';
import { CAInfo } from '@portkey/did';
import { useCopyToClipboard } from 'react-use';
import CommonButton from '../CommonButton';
import CommonPromptCard, { PromptCardType } from '../CommonPromptCard';
import { TokenItem } from './index.components';
import { BaseToken, IUserTokenItemResponse } from '../types/assets';
import './index.less';
import CommonModalTip from '../CommonModalTip';

export interface IPureProps {
  onBack?: () => void;
  selectToken: (IUserTokenItemResponse & { isNFT: boolean }) | BaseToken;
  setSelectedType: Dispatch<SetStateAction<string>>;
  setIsSelectionModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedDestination: ChainInfo | undefined;
  selectedSource: TReceiveFromNetworkItem | undefined;
  loading: boolean;
  eTransferLoading: boolean;
  isMainChainToMainChain: boolean;
  isExchangeSelected: boolean;
  setIsExchangeSelected: Dispatch<SetStateAction<boolean>>;
  generateAddress: () =>
    | {
        value: string;
        addressValue?: string;
        label: string;
      }
    | undefined;
  caInfo:
    | {
        [key: string]: CAInfo;
      }
    | undefined;
  destinationChain: ChainInfo | undefined;
  receiveType: ReceiveType;
  currentDepositInfo: TDepositInfo | undefined;
  renderTip: () => JSX.Element;
  showExchangeTip: boolean;
  isSelectionModalOpen: boolean;
  selectedType: string;
  renderSelectionList: NetworkItem[] | TReceiveFromNetworkItem[] | (ChainInfo | undefined)[];
  onSelectedChange: (item: TokenItem) => void;
  renderSelected: (item: TokenItem | NetworkItem) => JSX.Element | null;
  isReceivedExchangeModalOpen: boolean;
  setIsReceivedExchangeModalOpen: Dispatch<SetStateAction<boolean>>;
}
enum SELECTION_TYPE {
  SOURCE = 'Source',
  DESITNATION = 'Destination',
  NFT = 'NFT',
}
// enum CHAIN_ID {
//   AELF = 'AELF',
//   tDVV = 'tDVV',
//   tDVW = 'tDVW',
// }

type NetworkItem = {
  imageUrl: string;
  name: string;
  key: string;
};

export default function ReceiveCardPureComponent(props: IPureProps) {
  const {
    onBack,
    selectToken,
    setSelectedType,
    setIsSelectionModalOpen,
    selectedDestination,
    selectedSource,
    loading,
    eTransferLoading,
    isMainChainToMainChain,
    isExchangeSelected,
    setIsExchangeSelected,
    generateAddress,
    caInfo,
    destinationChain,
    receiveType,
    currentDepositInfo,
    renderTip,
    showExchangeTip,
    isSelectionModalOpen,
    selectedType,
    renderSelectionList,
    onSelectedChange,
    renderSelected,
    isReceivedExchangeModalOpen,
    setIsReceivedExchangeModalOpen,
  } = props;
  const [, setCopied] = useCopyToClipboard();
  const handleSelectionModalClose = useCallback(() => {
    setIsSelectionModalOpen(false);
  }, [setIsSelectionModalOpen]);
  const handleReceivedExchangeModalClose = useCallback(() => {
    setIsReceivedExchangeModalOpen(false);
  }, [setIsReceivedExchangeModalOpen]);
  return (
    <>
      <div className="portkey-ui-receive-content">
        <div className="receive-content-nav">
          <div className="left-icon" onClick={onBack}>
            <CustomSvg type="ArrowLeft" className="icon" fillColor="var(--sds-color-icon-default-default)" />
          </div>
          <div className="receive-content-header">
            <p className="symbol">Receive {selectToken.isNFT ? 'NFTs' : selectToken.label || selectToken.symbol}</p>
          </div>
          <div
            className="right-icon"
            onClick={() => window.open('https://doc.portkey.finance/docs/How-to-send-and-receive-assets')}>
            <CustomSvg type="Tooltip" className="icon" fillColor="var(--sds-color-icon-default-default)" />
          </div>
        </div>
        <div className="receive-content-body">
          <div
            className={clsx('source-destination-select-container', {
              'is-nft': selectToken.isNFT,
            })}>
            {selectToken.isNFT ? (
              <div className="source">
                <span>Network</span>
                <div
                  className="selected-source"
                  onClick={() => {
                    setSelectedType(SELECTION_TYPE.NFT);
                    setIsSelectionModalOpen(true);
                  }}>
                  {loading ? (
                    <div className="token-img-skeleton" />
                  ) : (
                    <img
                      className="token-img"
                      src={
                        selectedDestination?.chainImageUrl || (selectedDestination as unknown as NetworkItem)?.imageUrl
                      }
                    />
                  )}
                  {loading ? (
                    <div className="chain-name-container-skeleton" />
                  ) : (
                    <div className="chain-name-container">
                      <span>
                        {selectedDestination?.displayChainName || (selectedDestination as unknown as NetworkItem)?.name}
                      </span>
                      <CustomSvg
                        type="ChevronDown2"
                        className="icon"
                        fillColor="var(--sds-color-icon-default-default)"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="source">
                  <span>Source</span>
                  <div
                    className="selected-source"
                    onClick={() => {
                      setSelectedType(SELECTION_TYPE.SOURCE);
                      setIsSelectionModalOpen(true);
                    }}>
                    {loading ? (
                      <div className="token-img-skeleton" />
                    ) : (
                      <img className="token-img" src={selectedSource?.imageUrl} />
                    )}
                    {loading ? (
                      <div className="chain-name-container-skeleton" />
                    ) : (
                      <div className="chain-name-container">
                        <span>{selectedSource?.name}</span>
                        <CustomSvg
                          type="ChevronDown2"
                          className="icon"
                          fillColor="var(--sds-color-icon-default-default)"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="destination">
                  <span>Destination</span>
                  <div
                    className="selected-destination"
                    onClick={() => {
                      setSelectedType(SELECTION_TYPE.DESITNATION);
                      setIsSelectionModalOpen(true);
                    }}>
                    {loading ? (
                      <div className="token-img-skeleton" />
                    ) : (
                      <img className="token-img" src={selectedDestination?.chainImageUrl} />
                    )}
                    {loading ? (
                      <div className="chain-name-container-skeleton" />
                    ) : (
                      <div className="chain-name-container">
                        <span>{selectedDestination?.displayChainName}</span>
                        <CustomSvg
                          type="ChevronDown2"
                          className="icon"
                          fillColor="var(--sds-color-icon-default-default)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {loading || eTransferLoading ? (
            <div className="loading-container">
              <Loading width={32} height={32} />
            </div>
          ) : (
            <>
              {isMainChainToMainChain && !selectToken.isNFT && selectToken.symbol === 'ELF' && (
                <div className="exchange-selector-container">
                  <div className="exchange-selector">
                    <span
                      className={clsx('item', {
                        active: isExchangeSelected,
                      })}
                      onClick={() => {
                        setIsExchangeSelected(true);
                      }}>
                      Exchange
                    </span>
                    <span
                      className={clsx('item', {
                        active: !isExchangeSelected,
                      })}
                      onClick={() => {
                        setIsExchangeSelected(false);
                      }}>
                      Non-exchange
                    </span>
                  </div>
                  {isExchangeSelected && (
                    <div className="exchange-list">
                      <img className="exchange-icon" src={Binance} />
                      <img className="exchange-icon" src={OKX} />
                      <img className="exchange-icon" src={Upbit} />
                      <img className="exchange-icon" src={BitThumb} />
                      <img className="exchange-icon" src={GateIo} />
                      <img className="exchange-icon" src={Mexc} />
                      <img className="exchange-icon" src={Hotcoin} />
                    </div>
                  )}
                </div>
              )}

              <div className={clsx('portkey-qrcode-container', isMainChainToMainChain && 'mainchain')}>
                <PortkeyQRCode value={generateAddress()?.value} ecLevel="H" />
                <div className="address-container">
                  {caInfo?.[destinationChain?.chainId as ChainId]?.caAddress && (
                    <>
                      <span className="address">{generateAddress()?.label}</span>
                      <CustomSvg
                        type="Copy"
                        onClick={() => {
                          singleMessage.success('Address copied');
                          setCopied(generateAddress()?.addressValue || generateAddress()?.value || '');
                        }}
                        fillColor="var(--sds-color-icon-default-default)"
                      />
                    </>
                  )}
                </div>
              </div>
              {receiveType === ReceiveType.ETransfer &&
                currentDepositInfo &&
                (Number(currentDepositInfo?.minAmount) > 0 || Number(currentDepositInfo?.serviceFee) > 0) && (
                  <div className="receive-card-fee-tips">
                    {Number(currentDepositInfo?.minAmount) > 0 && (
                      <div className="receive-card-fee-item-container">
                        <span>Minimum deposit</span>
                        <div className="receive-card-fee-item-container-right">
                          <span>{`${currentDepositInfo.minAmount} ${selectToken.symbol}`}</span>
                          <span className="usd">{`$${currentDepositInfo.minAmountUsd}`}</span>
                        </div>
                      </div>
                    )}
                    {Number(currentDepositInfo?.serviceFee) > 0 && (
                      <div className="receive-card-fee-item-container">
                        <div className="receive-card-fee-item-left">
                          <span>Service fee</span>
                          <CommonModalTip
                            title="Service fee"
                            content="This is an estimated fee charged by Cobo to cover the costs of asset consolidation.
  Deposit amount ≥ 2 USDT: No service fee
  Deposit amount < USDT: Max service fee 0.5 USDT"
                          />
                        </div>
                        <div className="receive-card-fee-item-container-right">
                          <span>{`0~${currentDepositInfo.serviceFee} ${selectToken.symbol}`}</span>
                          <span className="usd">{`0~$${currentDepositInfo.serviceFeeUsd}`}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              <div className="reminder-container">
                <CustomSvg type="InfoFilled" className="info-icon" fillColor="var(--sds-color-border-brand-tertiary)" />
                {renderTip()}
              </div>

              {showExchangeTip && (
                <CommonPromptCard
                  className="exchange-tip"
                  type={PromptCardType.WARNING}
                  description={'If you\'re transferring from an exchange, set the destination to "aelf MainChain"'}
                />
              )}

              {receiveType === ReceiveType.ETransfer && (
                <div className="powered-by-container">
                  <span>Powered by</span>
                  <CustomSvg fillColor="var(--sds-color-icon-default-default)" type="ETransfer" />
                </div>
              )}
            </>
          )}
        </div>
        <AssetModal
          open={isSelectionModalOpen}
          height="max-content"
          wrapClassName="portkey-ui-receive-modals"
          onClose={handleSelectionModalClose}
          closable
          maskClosable>
          <div className="received-modals-header">
            <span className="title">{selectedType} network</span>
            {/* <CustomSvg
              fillColor="var(--sds-color-icon-default-default)"
              type="Close2"
              onClick={() => setIsSelectionModalOpen(false)}
            /> */}
          </div>
          <div className="received-modals-body">
            {renderSelectionList?.map(
              (item: TokenItem | undefined) =>
                item && (
                  <div
                    key={(item as TReceiveFromNetworkItem).name || (item as ChainInfo).chainName}
                    className="source-item"
                    onClick={() => {
                      if (!item) return;

                      onSelectedChange(item);
                      setIsSelectionModalOpen(false);
                    }}>
                    <img
                      className="source-img"
                      src={(item as TReceiveFromNetworkItem).imageUrl || (item as ChainInfo).chainImageUrl}
                    />
                    <div className="source-name-container">
                      <span className="source-name">
                        {(item as TReceiveFromNetworkItem).name || (item as ChainInfo).displayChainName}
                      </span>
                      {renderSelected(item)}
                    </div>
                  </div>
                ),
            )}
          </div>
        </AssetModal>
        <AssetModal
          open={isReceivedExchangeModalOpen}
          height="max-content"
          wrapClassName="portkey-ui-receive-exchange-modals"
          onClose={handleReceivedExchangeModalClose}
          closable
          maskClosable>
          <div className="received-exchange-modals-header">
            <span className="title">Receive from an exchange?</span>
            {/* <CustomSvg
              fillColor="var(--sds-color-icon-default-default)"
              type="Close2"
              onClick={() => setIsReceivedExchangeModalOpen(false)}
            /> */}
          </div>
          <div className="received-exchange-modals-body">
            <div className="exchange-list">
              <img className="exchange-icon" src={Binance} />
              <img className="exchange-icon" src={OKX} />
              <img className="exchange-icon" src={Upbit} />
              <img className="exchange-icon" src={BitThumb} />
              <img className="exchange-icon" src={GateIo} />
              <img className="exchange-icon" src={Mexc} />
              <img className="exchange-icon" src={Hotcoin} />
            </div>
            <span className="description">
              Exchanges have a unique address for sending and receiving using the aelf network.
            </span>
            <CommonButton
              className="item-button"
              type="primary"
              onClick={() => {
                setIsReceivedExchangeModalOpen(false);
                setIsExchangeSelected(true);
              }}>
              Yes, receive from an exchange
            </CommonButton>

            <CommonButton
              className="item-button"
              type="outline"
              onClick={() => {
                setIsReceivedExchangeModalOpen(false);
                setIsExchangeSelected(false);
              }}>
              No, from a non-exchange address
            </CommonButton>
          </div>
        </AssetModal>
      </div>
    </>
  );
}
