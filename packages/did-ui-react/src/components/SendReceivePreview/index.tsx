import { useMemo } from 'react';
import { ZERO } from '../../constants/misc';
import { TransferTypeEnum } from '../../types/send';
import { formatStr2EllipsisStr } from '../../utils';
import { formatAmountShow, formatAmountUSDShow } from '../../utils/converter';
import CommonButton from '../CommonButton';
import { CommonModalTip } from '../CommonModalTip';
import { useTokenPrice } from '../context/PortkeyAssetProvider/hooks';
import CustomSvg from '../CustomSvg';
import { INetworkItem } from '../Send/components/SelectNetwork';
import { AssetTokenExpand } from '../types/assets';
import './index.less';
import { getEstimatedTime } from '../../utils/send';
import { usePortkey } from '../context';

export interface ISendReceivePreviewProps {
  sendAmount: string;
  networkFee: string;
  networkFeeUnit: string;
  receiveAmount: string;
  receiveAmountUsd: string;
  transactionFee: string;
  transactionUnit: string;
  transferType: TransferTypeEnum;
  targetNetwork?: INetworkItem;
  tokenInfo?: AssetTokenExpand;
  toAccount: {
    address: string;
  };
  onSend: () => void;
  isShowHeader?: boolean;
}

export default function SendReceivePreview(props: ISendReceivePreviewProps) {
  const {
    sendAmount,
    networkFee,
    networkFeeUnit,
    receiveAmount,
    receiveAmountUsd,
    transactionFee,
    transactionUnit,
    transferType,
    targetNetwork,
    tokenInfo,
    toAccount,
    onSend,
    isShowHeader,
  } = props;

  console.log('SendReceivePreview props', props);

  const price = useTokenPrice(tokenInfo?.symbol);
  const [{ networkType }] = usePortkey();

  const EstimateAmount = useMemo(() => {
    let _amount = sendAmount;

    // adjust etransfer
    if (
      ZERO.plus(sendAmount).isLessThanOrEqualTo(transactionFee || '') &&
      tokenInfo?.symbol === 'ELF' &&
      transferType === TransferTypeEnum.E_TRANSFER
    ) {
      return {
        estimateAmount: `0 ${tokenInfo?.label || tokenInfo?.symbol}`,
        estimateAmountUsd: networkType === 'MAINNET' ? '$0' : '',
      };
    }

    // adjust etransfer & ebridge
    if (transferType === TransferTypeEnum.E_BRIDGE || transferType === TransferTypeEnum.E_TRANSFER) {
      return {
        estimateAmount: `${receiveAmount} ${tokenInfo?.label || tokenInfo?.symbol}`,
        estimateAmountUsd: networkType === 'MAINNET' ? receiveAmountUsd : '',
      };
    }

    _amount = formatAmountShow(_amount, Number(tokenInfo?.decimals));
    const amountUsd = formatAmountShow(ZERO.plus(_amount).div(price));

    return {
      estimateAmount: `${_amount} ${tokenInfo?.label || tokenInfo?.symbol}`,
      estimateAmountUsd: networkType === 'MAINNET' ? amountUsd : '',
    };
  }, [
    networkType,
    price,
    receiveAmount,
    receiveAmountUsd,
    sendAmount,
    tokenInfo?.decimals,
    tokenInfo?.label,
    tokenInfo?.symbol,
    transactionFee,
    transferType,
  ]);

  const estimatedTime = useMemo(() => getEstimatedTime(targetNetwork, transferType), [targetNetwork, transferType]);

  const [isShowNetworkFee, isShowTransactionFee] = useMemo(() => {
    return [
      transferType === TransferTypeEnum.GENERAL_CROSS_CHAIN || transferType === TransferTypeEnum.GENERAL_SAME_CHAIN,
      transferType === TransferTypeEnum.GENERAL_CROSS_CHAIN || transferType === TransferTypeEnum.GENERAL_SAME_CHAIN,
    ];
  }, [transferType]);

  return (
    <div className="portkey-ui-send-receive-preview portkey-ui-flex-column">
      {isShowHeader && (
        <div className="portkey-ui-flex-between-center preview-header">
          <CustomSvg type="ArrowLeft" />
          <div>{`Preview`}</div>
          <CustomSvg type="help" />
        </div>
      )}
      <div className="portkey-ui-flex-1 preview-content">
        <div className="portkey-ui-flex-column-center">
          <CustomSvg type="SendActivity" />
          <div className="amount-show">{`${formatAmountShow(sendAmount, tokenInfo?.decimals)} ${
            tokenInfo?.symbol
          }`}</div>
          <div className="usd-show">{`${formatAmountUSDShow(ZERO.plus(sendAmount).div?.(price))}`}</div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div>{`To`}</div>
          <div className="value-show">{formatStr2EllipsisStr(toAccount.address, [8, 8])}</div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div>{`Destination network`}</div>
          <div className="value-show portkey-ui-flex-row-center gap-4">
            {transferType === TransferTypeEnum.GENERAL_SAME_CHAIN ||
            transferType === TransferTypeEnum.GENERAL_CROSS_CHAIN ? (
              <>
                <CustomSvg type="ELF" className="chain-image" />
                {`aelf dAppChain`}
              </>
            ) : (
              <>
                <img src={targetNetwork?.imageUrl} className="chain-image" />
                {targetNetwork?.name}
              </>
            )}
          </div>
        </div>
        {isShowTransactionFee && (
          <div className="portkey-ui-flex-between-center content-row-info">
            <div>
              <div className="portkey-ui-flex-row-center gap-4">
                {`Transaction fee`}
                <CommonModalTip
                  title="Transaction fee"
                  content="Fee applied by the cross-chain bridge to process your transaction on blockchains."
                />
              </div>
              <div className="below-show text-color-danger">{`Not enough ELF`}</div>
            </div>
            <div className="value-show">
              <div className="text-color-danger">{`${networkFee} ${networkFeeUnit}`}</div>
              <div className="below-show text-color-danger">{`$ `}</div>
            </div>
          </div>
        )}
        {isShowNetworkFee && (
          <div className="portkey-ui-flex-between-center content-row-info">
            <div className="portkey-ui-flex-row-center gap-4">
              {`Estimated network fee`}
              <CommonModalTip
                title="Estimated network fee"
                content="Fee applied by the blockchain to process your transaction, also known as gas fee."
              />
            </div>
            <div className="value-show">
              <div>{`${transactionFee} ${transactionUnit}`}</div>
              <div className="below-show">{`$0`}</div>
            </div>
          </div>
        )}
        <div className="portkey-ui-flex-between-center content-row-info">
          <div className="portkey-ui-flex-row-center gap-4">{`Amount to receive`}</div>
          <div className="value-show">
            <div>{EstimateAmount.estimateAmount}</div>
            <div className="below-show">{EstimateAmount?.estimateAmountUsd}</div>
          </div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div>{`Estimated duration`}</div>
          <div className="value-show">{estimatedTime}</div>
        </div>
        {(transferType === TransferTypeEnum.E_BRIDGE || transferType === TransferTypeEnum.E_TRANSFER) && (
          <div className="portkey-ui-flex-center powered-by gap-4">
            <div>{`Powered by`}</div>
            <CustomSvg type={transferType === TransferTypeEnum.E_BRIDGE ? 'pb-ebridge' : 'pb-eTransfer'} />
          </div>
        )}
      </div>
      <div className="preview-footer">
        <CommonButton onClick={onSend} block type="primary">{`Send`}</CommonButton>
      </div>
    </div>
  );
}
