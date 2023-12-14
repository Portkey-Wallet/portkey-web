import { useCopyToClipboard } from 'react-use';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import CustomSvg from '../CustomSvg';
import { useThrottleCallback } from '../../hooks/throttle';
import { useRef } from 'react';
import singleMessage from '../CustomAnt/message';

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

  const isClose = useRef<boolean>();

  const copyHandler = useThrottleCallback(
    () => {
      setCopied(toCopy);
      if (isClose.current) return;
      isClose.current = true;
      singleMessage.success(t('Copy Success'), 2, () => {
        isClose.current = false;
      });
    },
    [],
    2500,
  );

  return (
    <span
      onClick={copyHandler}
      className={clsx('portkey-ui-flex-row-center portkey-ui-copy-wrapper', className)}
      style={{ cursor: 'pointer' }}>
      <CustomSvg type={iconType as any} className={clsx(['copy-icon', iconClassName])} />
      {children}
    </span>
  );
}
