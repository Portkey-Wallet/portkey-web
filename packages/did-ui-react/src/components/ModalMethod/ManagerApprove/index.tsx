import ManagerApproveContent, { BaseManagerApproveInnerProps } from '../../ManagerApprove/index.component';
import BaseModalFunc from '../BaseModalMethod';
import { IGuardiansApproved } from '../../../types';
interface ManagerApproveModalProps {
  wrapClassName?: string;
  className?: string;
}

export type ManagerApproveProps = BaseManagerApproveInnerProps & ManagerApproveModalProps;

const managerApprove = async ({
  wrapClassName,
  className,
  ...props
}: ManagerApproveProps): Promise<{
  amount: string;
  batchApproveToken: boolean;
  symbol: string;
  guardiansApproved: IGuardiansApproved[];
}> =>
  new Promise((resolve, reject) => {
    const onCancel = () => {
      reject(Error('User Cancel'));
      modal.destroy();
    };
    const modal = BaseModalFunc({
      ...props,
      wrapClassName: 'portkey-ui-manager-approve-modal-wrapper ' + wrapClassName,
      className:
        `${props.showBatchApproveToken ? 'portkey-ui-h-644' : 'portkey-ui-h-566'} portkey-ui-manager-approve-modal ` +
        className,
      onCancel,
      content: (
        <ManagerApproveContent
          {...props}
          onCancel={onCancel}
          onFinish={(res) => {
            resolve(res);
            modal.destroy();
          }}
          onError={(error) => {
            reject(error);
            modal.destroy();
          }}
        />
      ),
    });
  });

export default managerApprove;
