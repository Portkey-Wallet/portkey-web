import ManagerApproveContent, { BaseManagerApproveInnerProps } from '../../ManagerApprove/index.component';
import BaseModalFunc from '../BaseModalMethod';
interface ManagerApproveModalProps {
  wrapClassName?: string;
  className?: string;
}

export type ManagerApproveProps = BaseManagerApproveInnerProps & ManagerApproveModalProps;

const managerApprove = async ({ wrapClassName, className, ...props }: ManagerApproveProps) =>
  new Promise((resolve, reject) => {
    const modal = BaseModalFunc({
      ...props,
      wrapClassName: 'portkey-ui-manager-approve-modal-wrapper ' + wrapClassName,
      className: 'portkey-ui-h-566 portkey-ui-manager-approve-modal ' + className,
      content: (
        <ManagerApproveContent
          {...props}
          onCancel={() => {
            reject(Error('User Cancel'));
            modal.destroy();
          }}
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
