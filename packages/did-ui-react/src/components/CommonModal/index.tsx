import { Col, Row } from 'antd';
import clsx from 'clsx';
import { LeftOutlined as LeftOutlinedIcon } from '@ant-design/icons';
import { ReactNode } from 'react';
import CommonBaseModal from '../CommonBaseModal';
import { PortkeyModalProps } from '../PortkeyModal';
import './styles.less';

const LeftOutlined = (LeftOutlinedIcon as any).default || LeftOutlinedIcon;
export interface CommonModalProps extends PortkeyModalProps {
  className?: string;
  leftCallBack?: () => void;
  leftElement?: ReactNode;
}

export default function CommonModal(props: CommonModalProps) {
  const { leftCallBack, width, title, leftElement } = props;
  return (
    <CommonBaseModal
      destroyOnClose
      {...props}
      width={width ? width : '400px'}
      className={clsx('portkey-ui-common-modals', props.className)}
      title={
        <Row justify="space-between">
          {leftCallBack || leftElement ? (
            <Col className="common-modal-left-icon" flex={1} onClick={leftCallBack}>
              {leftElement || (LeftOutlined && <LeftOutlined />)}
            </Col>
          ) : null}
          <Col flex={2} style={{ textAlign: 'center' }}>
            {title}
          </Col>
          {leftCallBack || leftElement ? <Col flex={1} /> : null}
        </Row>
      }
    />
  );
}
