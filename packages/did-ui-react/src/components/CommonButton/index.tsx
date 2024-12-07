import { Button, ButtonProps } from 'antd';
import clsx from 'clsx';
import { Loading } from '..';
import { useMemo } from 'react';
import './index.less';

export type CommonButtonProps = {
  loadingWidth?: number;
  loadingHeight?: number;
  type: 'primary' | 'outline';
} & Omit<ButtonProps, 'type'>;

export default function CommonButton(props: CommonButtonProps) {
  const { loadingWidth, loadingHeight, className, loading, children, type, ...prop } = props;
  console.log('===type', type);
  const btnClsName = useMemo(() => `portkey-btn-${type}`, [type]);
  return (
    <Button
      className={clsx('portkey-ui-common-button portkey-ui-flex-center', btnClsName, className)}
      {...prop}
      type={type === 'primary' ? type : undefined}>
      {loading ? <Loading width={loadingWidth} height={loadingHeight} /> : children}
    </Button>
  );
}
