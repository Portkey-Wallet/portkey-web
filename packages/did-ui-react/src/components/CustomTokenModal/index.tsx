import { ModalProps } from 'antd';
import CustomTokenList, { ICustomTokenListProps } from '../CustomTokenList';
import './index.less';
import CommonModal from '../CommonModal';
import clsx from 'clsx';

type ICustomTokenModalProps = ModalProps & ICustomTokenListProps;

export default function CustomTokenModal({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  tokenList,
  networkType,
  wrapClassName,
  ...props
}: ICustomTokenModalProps) {
  return (
    <CommonModal
      width={430}
      {...props}
      closable={false}
      wrapClassName={clsx('portkey-ui-custom-token-modal', wrapClassName)}
      maskClosable={true}
      onCancel={onClose}>
      <CustomTokenList
        tokenList={tokenList}
        title={title}
        networkType={networkType}
        searchPlaceHolder={searchPlaceHolder}
        onClose={onClose}
        onChange={onChange}
      />
    </CommonModal>
  );
}
