import { ModalProps } from 'antd';
import CustomTokenList, { ICustomTokenListProps } from '../CustomTokenList';
import AssetModal from '../AssetModal';
import './index.less';

type ICustomTokenModalProps = ModalProps & ICustomTokenListProps;

export default function CustomTokenModal({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  tokenList,
  networkType,
  ...props
}: ICustomTokenModalProps) {
  return (
    <AssetModal {...props} maskClosable={true} onCancel={onClose}>
      <CustomTokenList
        tokenList={tokenList}
        title={title}
        networkType={networkType}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
      />
    </AssetModal>
  );
}
