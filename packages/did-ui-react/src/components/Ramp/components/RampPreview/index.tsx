import { IRampCryptoItem, RampType } from '@portkey/ramp';
import { RampStep } from '../../index.component';
import { getBuyFiat } from '../../utils/api';
import { TRampPreviewInitState } from '../../../../types';
import { ChainId } from '@portkey/types';
import RampBuy from './component/RampBuy';
import RampSell from './component/RampSell';

export interface IRampPreviewProp {
  selectedCrypto: IRampCryptoItem;
  pageType: RampType;
  setStep: (rampStep: RampStep) => void;
  list: IRampCryptoItem[];
  isMainnet: boolean;
  isSellShow: boolean;
  isBuyShow: boolean;
  onBack: () => void;
  onShowPreview: ({ initState, chainId }: { initState: TRampPreviewInitState; chainId: ChainId }) => void;
}
export default function RampPreview({
  selectedCrypto,
  pageType,
  list,
  isMainnet,
  isSellShow,
  isBuyShow,
  setStep,
  onBack,
  onShowPreview,
}: IRampPreviewProp) {
  getBuyFiat({
    crypto: selectedCrypto.symbol,
    network: selectedCrypto.network,
  });
  return (
    <>
      {pageType === RampType.BUY && (
        <RampBuy
          selectedCrypto={selectedCrypto}
          setStep={setStep}
          buyCryptoList={list}
          isMainnet={isMainnet}
          isBuyShow={isBuyShow}
          onBack={onBack}
          onShowPreview={onShowPreview}
        />
      )}
      {pageType === RampType.SELL && (
        <RampSell
          selectedCrypto={selectedCrypto}
          setStep={setStep}
          sellCryptoList={list}
          isMainnet={isMainnet}
          isSellShow={isSellShow}
          onBack={onBack}
          onShowPreview={onShowPreview}
        />
      )}
    </>
  );
}
