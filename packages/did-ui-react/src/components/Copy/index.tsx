import { useCopyToClipboard } from 'react-use';
import { message } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import CustomSvg from '../CustomSvg';

export default function Copy({
  toCopy,
  children,
  className,
  iconType = 'Copy',
  iconClassName,
}: {
  toCopy: string;
  children?: React.ReactNode;
  className?: string;
  iconType?: string;
  iconClassName?: string;
}) {
  const { t } = useTranslation();
  const [, setCopied] = useCopyToClipboard();

  return (
    <span
      onClick={() => {
        setCopied(toCopy);
        message.success(t('Copy Success'));
      }}
      className={clsx('portkey-ui-flex-row-center portkey-ui-copy-wrapper', className)}
      style={{ cursor: 'pointer' }}>
      <CustomSvg type={iconType as any} className={clsx(['copy-icon', iconClassName])} />
      {children}
    </span>
  );
}
