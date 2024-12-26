import CustomSvg from '../CustomSvg';
import { useEffect, useMemo, useState } from 'react';
import { ChainId } from '@portkey/types';
import { useReceive, useReceiveByETransfer } from '../../hooks/useReceive';
import { BaseToken } from '../types/assets';
import { ChainInfo, ReceiveType, TDepositInfo, TReceiveFromNetworkItem } from '@portkey/services';
import { MAIN_CHAIN_ID } from '../../constants/network';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { formatStr2EllipsisStr } from '../../utils';
import ReceiveCardPureComponent from './index.pure';

enum SELECTION_TYPE {
  SOURCE = 'Source',
  DESITNATION = 'Destination',
  NFT = 'NFT',
}

enum CHAIN_ID {
  AELF = 'AELF',
  tDVV = 'tDVV',
  tDVW = 'tDVW',
}

type NetworkItem = {
  imageUrl: string;
  chainId: ChainId;
  name: string;
  key: string;
};

export type TokenItem = TReceiveFromNetworkItem | ChainInfo | NetworkItem;

const NETWORK_LIST: NetworkItem[] = [
  {
    imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/dappChain.png',
    chainId: CHAIN_ID.tDVW,
    name: 'aelf dAppChain',
    key: 'aelf dAppChain',
  },
  {
    imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/mainChain.png',
    chainId: CHAIN_ID.tDVV,
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
    loading,
    receiveType,
    destinationChain,
    destinationChainList,
    updateDestinationChain,
    sourceChain,
    sourceChainList,
    setSourceChain,
  } = useReceive(selectToken);
  console.log('receiveType', receiveType, 'sourceChain', sourceChain, 'destinationChain', destinationChain);
  console.log('selectToken', selectToken);

  const [isExchangeSelected, setIsExchangeSelected] = useState(selectToken.symbol === 'ELF');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<TReceiveFromNetworkItem>();
  const [selectedDestination, setSelectedDestination] = useState<ChainInfo | undefined>();
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isReceivedExchangeModalOpen, setIsReceivedExchangeModalOpen] = useState(false);
  const [currentDepositInfo, setCurrentDepositInfo] = useState<TDepositInfo>();
  const [{ caInfo }] = usePortkeyAsset();

  const { loading: eTransferLoading, depositInfo } = useReceiveByETransfer({
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
    if (sourceChain && !selectToken.isNFT) {
      setSelectedSource(sourceChain);
    }

    if (destinationChain) {
      setSelectedDestination(destinationChain);
    }

    if (isMainChainToMainChain && !selectToken.isNFT && selectToken.symbol === 'ELF') {
      setIsReceivedExchangeModalOpen(true);
    }
  }, [sourceChain, destinationChain, isMainChainToMainChain, selectToken.isNFT, selectToken.symbol]);

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

    if (!selectToken.isNFT) {
      updateDestinationChain(item as ChainInfo);
    }
  };

  const renderSelected = (item: TokenItem | NetworkItem) => {
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
      if (
        selectedDestination === item ||
        (selectToken.isNFT && selectedDestination?.displayChainName === (item as NetworkItem).name)
      ) {
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
    if (currentDepositInfo && selectedSource && !Object.keys(CHAIN_ID).includes(selectedSource?.network)) {
      return {
        value: currentDepositInfo.depositAddress,
        label: formatStr2EllipsisStr(currentDepositInfo.depositAddress, [6, 4]),
      };
    }

    if (selectToken.isNFT && selectedSource) {
      const network = selectedDestination ? selectedDestination?.chainId : selectedSource?.network;
      return {
        value: `ELF_${address}_${network}`,
        label: `ELF_${formatStr2EllipsisStr(address, [4, 4])}_${network}`,
      };
    }

    if (address && selectedDestination) {
      if (
        isMainChainToMainChain ||
        !(selectedDestination && Object.keys(CHAIN_ID).includes(selectedDestination?.chainId))
      ) {
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
    <ReceiveCardPureComponent
      onBack={onBack}
      selectToken={selectToken}
      setSelectedType={setSelectedType}
      setIsSelectionModalOpen={setIsSelectionModalOpen}
      selectedDestination={selectedDestination}
      selectedSource={selectedSource}
      loading={loading}
      eTransferLoading={eTransferLoading}
      isMainChainToMainChain={isMainChainToMainChain}
      isExchangeSelected={isExchangeSelected}
      setIsExchangeSelected={setIsExchangeSelected}
      generateAddress={generateAddress}
      caInfo={caInfo}
      destinationChain={destinationChain}
      receiveType={receiveType}
      currentDepositInfo={currentDepositInfo}
      renderTip={renderTip}
      showExchangeTip={showExchangeTip}
      isSelectionModalOpen={isSelectionModalOpen}
      selectedType={selectedType}
      renderSelectionList={renderSelectionList}
      onSelectedChange={onSelectedChange}
      renderSelected={renderSelected}
      isReceivedExchangeModalOpen={isReceivedExchangeModalOpen}
      setIsReceivedExchangeModalOpen={setIsReceivedExchangeModalOpen}
    />
  );
}
