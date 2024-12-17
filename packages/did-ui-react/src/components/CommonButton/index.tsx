import { Button, ButtonProps } from 'antd';
import clsx from 'clsx';
import { Loading } from '..';
import { useMemo } from 'react';
import './index.less';

export type CommonButtonType =
  | 'default'
  | 'primary'
  | 'ghost'
  | 'dashed'
  | 'link'
  | 'text'
  | 'outline'
  | 'primaryOutline';

export type CommonButtonProps = {
  loadingWidth?: number;
  loadingHeight?: number;
  type?: CommonButtonType;
} & Omit<ButtonProps, 'type'>;

export default function CommonButton(props: CommonButtonProps) {
  const { loadingWidth, loadingHeight, className, loading, children, type = 'default', ...prop } = props;
  const btnClsName = useMemo(() => `portkey-btn-${type}`, [type]);
  return (
    <Button
      className={clsx('portkey-ui-common-button portkey-ui-flex-center', btnClsName, className)}
      {...prop}
      type={type === 'outline' || type === 'primaryOutline' ? undefined : type}>
      {loading ? <Loading width={loadingWidth} height={loadingHeight} /> : children}
    </Button>
  );
}
