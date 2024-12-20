import { useCopyToClipboard } from 'react-use';
import CustomSvg from '../CustomSvg';
import { useEffect, useMemo, useState } from 'react';
import PortkeyQRCode from '../PortkeyQRCode';
import { ChainId } from '@portkey/types';
import { useReceive, useReceiveByETransfer } from '../../hooks/useReceive';
import { BaseToken } from '../types/assets';
import { ChainInfo, ReceiveType, TDepositInfo, TReceiveFromNetworkItem } from '@portkey/services';
import AssetModal from '../AssetModal';
import { MAIN_CHAIN_ID } from '../../constants/network';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { formatStr2EllipsisStr, setLoading } from '../../utils';
import CommonButton from '../CommonButton';

import Binance from '../../assets/imgs/binance.png';
import OKX from '../../assets/imgs/okx.png';
import Upbit from '../../assets/imgs/upbit.png';
import BitThumb from '../../assets/imgs/bithumb.png';
import GateIo from '../../assets/imgs/gate_io.png';
import Mexc from '../../assets/imgs/mexc.png';
import Hotcoin from '../../assets/imgs/hotcoin.png';
import clsx from 'clsx';
import CommonPromptCard, { PromptCardType } from '../CommonPromptCard';
import { isNFT } from '../../utils/assets';

import './index.less';

enum SELECTION_TYPE {
  SOURCE = 'Source',
  DESITNATION = 'Destination',
  NFT = 'NFT',
}

type NetworkItem = {
  imageUrl: string;
  name: string;
  key: string;
};

export type TokenItem = TReceiveFromNetworkItem | ChainInfo | NetworkItem;

const NETWORK_LIST: NetworkItem[] = [
  {
    imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/dappChain.png',
    name: 'aelf dAppChain',
    key: 'aelf dAppChain',
  },
  {
    imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/mainChain.png',
    name: 'aelf MainChain',
    key: 'aelf MainChain',
  },
];

export interface ReceiveCardProps {
  onBack?: () => void;
  selectToken: BaseToken;
}

export default function ReceiveCardMain({ onBack, selectToken }: ReceiveCardProps) {
  const {
    receiveType,
    destinationChain,
    destinationChainList,
    updateDestinationChain,
    sourceChain,
    sourceChainList,
    setSourceChain,
  } = useReceive(selectToken);

  const [, setCopied] = useCopyToClipboard();
  const [isExchangeSelected, setIsExchangeSelected] = useState(selectToken.symbol === 'ELF');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<TReceiveFromNetworkItem>();
  const [selectedDestination, setSelectedDestination] = useState<ChainInfo | undefined>();
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isReceivedExchangeModalOpen, setIsReceivedExchangeModalOpen] = useState(false);
  const [currentDepositInfo, setCurrentDepositInfo] = useState<TDepositInfo>();
  const [{ caInfo }] = usePortkeyAsset();

  const { depositInfo } = useReceiveByETransfer({
    toChainId: destinationChain?.chainId as ChainId,
    toSymbol: selectToken.symbol,
    fromNetwork: selectedSource?.network || '',
    fromSymbol: selectToken.symbol,
    receiveType,
  });

  const isMainChainToMainChain =
    selectedSource?.network === MAIN_CHAIN_ID && selectedDestination?.chainId === MAIN_CHAIN_ID;

  useEffect(() => {
    if (depositInfo) {
      setCurrentDepositInfo(depositInfo);
    }
  }, [depositInfo]);

  useEffect(() => {
    setLoading(true);
    if (sourceChain) {
      setSelectedSource(sourceChain);
    }

    if (destinationChain) {
      setSelectedDestination(destinationChain);
    }

    if (sourceChain && destinationChain) {
      setLoading(false);
    }

    if (isMainChainToMainChain && !selectToken.isNFT) {
      setIsReceivedExchangeModalOpen(true);
    }
  }, [sourceChain, destinationChain, isMainChainToMainChain, selectToken.isNFT]);

  const showExchangeTip = useMemo(
    () =>
      selectToken?.symbol === 'ELF' &&
      sourceChain?.network === MAIN_CHAIN_ID &&
      destinationChain?.chainId !== MAIN_CHAIN_ID,
    [destinationChain?.chainId, selectToken?.symbol, sourceChain?.network],
  );

  const onSelectedChange = (item: TokenItem) => {
    if (selectedType === SELECTION_TYPE.SOURCE) {
      setSourceChain(item as TReceiveFromNetworkItem);
      setSelectedSource(item as TReceiveFromNetworkItem);
      return;
    }
    setSelectedDestination(item as ChainInfo);
    updateDestinationChain(item as ChainInfo);
  };

  const renderSelected = (item: TokenItem) => {
    const selection = (
      <div className="icon-wrapper">
        <CustomSvg type="Check" fillColor="var(--sds-color-background-default-default)" className="selected-icon" />
      </div>
    );

    if (selectedType === SELECTION_TYPE.SOURCE) {
      if (selectedSource === item) {
        return selection;
      }
    } else {
      if (selectedDestination === item) {
        return selection;
      }
    }

    return null;
  };

  const renderSelectionList = useMemo(() => {
    if (selectedType === SELECTION_TYPE.NFT) {
      return NETWORK_LIST;
    }
    if (selectedType === SELECTION_TYPE.SOURCE) {
      return sourceChainList;
    }

    return destinationChainList || [];
  }, [destinationChainList, selectedType, sourceChainList]);

  const renderTip = () => {
    if (selectToken.isNFT) {
      return (
        <span>
          Use this address to receive assets on the <span className="chain">{selectedSource?.name}</span>
        </span>
      );
    }

    if (isMainChainToMainChain && isExchangeSelected) {
      return (
        <span>
          Send {selectToken.symbol} on <span className="chain">{selectedSource?.name}</span> from exchange to this
          address and receive on the <span className="chain">{destinationChain?.displayChainName}</span>
        </span>
      );
    }

    if (receiveType === ReceiveType.ETransfer) {
      return (
        <span>
          Send {selectToken.symbol} on <span className="chain">{selectedSource?.name}</span> to this address and receive
          on the <span className="chain">{selectedDestination?.displayChainName}</span>. Transfers from both exchange
          and non-exchange addresses are accepted.
        </span>
      );
    }

    return (
      <span>
        Send {selectToken.symbol} on <span className="chain">{selectedSource?.name}</span> to this address and receive
        on the <span className="chain">{selectedDestination?.displayChainName}</span>.
      </span>
    );
  };

  const generateAddress = () => {
    const address = caInfo?.[destinationChain?.chainId as ChainId]?.caAddress;

    if (selectToken.isNFT && selectedSource) {
      return {
        value: `ELF_${address}_${selectedSource.network}`,
        label: `ELF_${formatStr2EllipsisStr(address, [4, 4])}_${selectedSource.network}`,
      };
    }

    if (currentDepositInfo) {
      return {
        value: currentDepositInfo.depositAddress,
        label: formatStr2EllipsisStr(currentDepositInfo.depositAddress, [6, 4]),
      };
    }

    if (address && selectedDestination) {
      if (isMainChainToMainChain) {
        if (isExchangeSelected) {
          return {
            value: address,
            label: formatStr2EllipsisStr(address, [6, 4]),
          };
        }
      }
      return {
        value: `ELF_${address}_${selectedDestination.chainId}`,
        label: `ELF_${formatStr2EllipsisStr(address, [4, 4])}_${selectedDestination.chainId}`,
      };
    }
  };

  return (
    <>
      <div className="portkey-ui-receive-content">
        <div className="receive-content-nav">
          <div className="left-icon" onClick={onBack}>
            <CustomSvg type="ArrowLeft" className="icon" fillColor="var(--sds-color-icon-default-default)" />
          </div>
          <div className="receive-content-header">
            <p className="symbol">Receive {selectToken.isNFT ? 'NFTs' : selectToken.symbol}</p>
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
              'is-nft': isNFT,
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
                  <img className="token-img" src={selectedSource?.imageUrl} />
                  <div className="chain-name-container">
                    <span>{selectedSource?.name}</span>
                    <CustomSvg type="ChevronDown2" className="icon" fillColor="var(--sds-color-icon-default-default)" />
                  </div>
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
                    <img className="token-img" src={selectedSource?.imageUrl} />
                    <div className="chain-name-container">
                      <span>{selectedSource?.name}</span>
                      <CustomSvg
                        type="ChevronDown2"
                        className="icon"
                        fillColor="var(--sds-color-icon-default-default)"
                      />
                    </div>
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
                    <img className="token-img" src={selectedDestination?.chainImageUrl} />
                    <div className="chain-name-container">
                      <span>{selectedDestination?.displayChainName}</span>
                      <CustomSvg
                        type="ChevronDown2"
                        className="icon"
                        fillColor="var(--sds-color-icon-default-default)"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {isMainChainToMainChain && !selectToken.isNFT && (
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
                    onClick={() => setCopied(caInfo?.[destinationChain?.chainId as ChainId]?.caAddress)}
                    fillColor="var(--sds-color-icon-default-default)"
                  />
                </>
              )}
            </div>
          </div>
          {receiveType === ReceiveType.ETransfer && currentDepositInfo && Number(currentDepositInfo?.minAmount) > 0 && (
            <div className="minimum-deposit-container">
              <span>Minimum deposit</span>
              <div className="minimum-deposit">
                <span>{`${currentDepositInfo.minAmount} ${selectToken.symbol}`}</span>
                <span className="usd">{`$${currentDepositInfo.minAmountUsd}`}</span>
              </div>
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
        </div>
        <AssetModal open={isSelectionModalOpen} height="max-content" wrapClassName="portkey-ui-receive-modals">
          <div className="received-modals-header">
            <span className="title">{selectedType} network</span>
            <CustomSvg
              fillColor="var(--sds-color-icon-default-default)"
              type="Close2"
              onClick={() => setIsSelectionModalOpen(false)}
            />
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
          wrapClassName="portkey-ui-receive-exchange-modals">
          <div className="received-exchange-modals-header">
            <span className="title">Receive from an exchange?</span>
            <CustomSvg
              fillColor="var(--sds-color-icon-default-default)"
              type="Close2"
              onClick={() => setIsReceivedExchangeModalOpen(false)}
            />
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
