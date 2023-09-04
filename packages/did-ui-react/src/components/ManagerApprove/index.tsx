import { Modal } from 'antd';
import ManagerApproveContent, { ManagerApproveInnerProps } from './index.component';
import './index.less';

interface ManagerApproveModalProps {
  wrapClassName?: string;
  className?: string;
}

export type ManagerApproveProps = ManagerApproveInnerProps & ManagerApproveModalProps;

const managerApprove = async ({ wrapClassName, className, ...props }: ManagerApproveProps) =>
  new Promise((resolve, reject) => {
    const modal = Modal.confirm({
      width: 600,
      icon: null,
      centered: true,
      okText: 'Confirm',
      ...props,
      wrapClassName: 'portkey-ui-wrapper portkey-ui-common-modals portkey-ui-manager-approve-wrapper ' + wrapClassName,
      className: 'portkey-ui-manager-approve-modal ' + className,
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
      okButtonProps: { style: { display: 'none' } },
    });
  });

export default managerApprove;
