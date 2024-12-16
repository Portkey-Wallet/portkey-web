import { ModalProps } from 'antd';
import AssetModal from '../AssetModal';
import TitleWrapper from '../TitleWrapper';
import CustomSvg from '../CustomSvg';
import '../CustomTokenList/index.less';
import Transaction from '../Transaction';
import { ActivityItemType } from '@portkey/types';
import { CaAddressInfosType } from '@portkey/services';
import TransactionMain from '../Transaction/index.component';

type ICustomTokenModalProps = ModalProps & {
  onCancel: () => void;
  transactionDetail: ActivityItemType | undefined;
  caAddressInfos: CaAddressInfosType | undefined;
};

export default function CustomAssetModal({
  onCancel,
  caAddressInfos,
  transactionDetail,
  ...props
}: ICustomTokenModalProps) {
  return (
    <AssetModal {...props}>
      <TransactionMain
        chainId={transactionDetail?.chainId || undefined}
        caAddressInfos={caAddressInfos}
        onClose={onCancel}
        transactionDetail={transactionDetail}
      />
    </AssetModal>
  );
}
