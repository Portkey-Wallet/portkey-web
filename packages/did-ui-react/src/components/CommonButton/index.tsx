import { Button, ButtonProps } from 'antd';
import clsx from 'clsx';
import { ConfigProvider, Loading } from '..';
import { useMemo } from 'react';
import './index.less';
import { LoadingColor } from '../Loading';
import { usePortkey } from '../context';

export type CommonButtonType =
  | 'default'
  | 'primary'
  | 'ghost'
  | 'dashed'
  | 'link'
  | 'text'
  | 'outline'
  | 'primaryOutline'
  | 'danger';

export type CommonButtonProps = {
  loadingWidth?: number;
  loadingHeight?: number;
  type?: CommonButtonType;
} & Omit<ButtonProps, 'type'>;

export default function CommonButton(props: CommonButtonProps) {
  const { loadingWidth, loadingHeight, className, loading, children, type = 'default', ...prop } = props;
  const btnClsName = useMemo(() => `portkey-btn-${type}`, [type]);
  const theme = useMemo(() => ConfigProvider?.getGlobalConfig()?.theme, []);
  const color = useMemo(() => {
    if (theme == 'light') {
      if (type === 'primary' || type === 'primaryOutline' || type === 'danger') {
        return LoadingColor.WHITE;
      }
    } else {
      if (type === 'primary' || type === 'primaryOutline' || type === 'danger') {
        return LoadingColor.DARK;
      }
    }
    return undefined;
  }, [theme, type]);
  return (
    <Button
      className={clsx('portkey-ui-common-button portkey-ui-flex-center', btnClsName, className)}
      {...prop}
      type={type === 'outline' || type === 'primaryOutline' || type === 'danger' ? undefined : type}>
      {loading ? (
        <Loading width={loadingWidth} height={loadingHeight} color={color} isDarkThemeWhiteLoading />
      ) : (
        children
      )}
    </Button>
  );
}
