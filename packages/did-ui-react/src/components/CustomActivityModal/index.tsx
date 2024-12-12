import { ModalProps } from 'antd';
import AssetModal from '../AssetModal';
import TitleWrapper from '../TitleWrapper';
import CustomSvg from '../CustomSvg';
import '../CustomTokenList/index.less';

type ICustomTokenModalProps = ModalProps & {
  onCancel: () => void;
};

export default function CustomAssetModal({ onCancel, ...props }: ICustomTokenModalProps) {
  return (
    <AssetModal {...props} onClose={onCancel}>
      <div className="portkey-ui-flex-column portkey-ui-custom-token-list">
        <TitleWrapper
          className="custom-token-header"
          leftElement={false}
          title={'Receive'}
          rightElement={<CustomSvg type="Close2" onClick={onCancel} />}
        />
      </div>
    </AssetModal>
  );
}
