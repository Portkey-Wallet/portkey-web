import { useMemo } from 'react';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import Loading from '../Loading';
import './index.less';

export enum PromptCardType {
  LOADING = 'loading',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
}

interface ICommonPromptCardProps {
  className?: string;
  type?: PromptCardType;
  title?: string;
  description: React.ReactNode;
}

export default function CommonPromptCard({
  className,
  type = PromptCardType.ERROR,
  title,
  description,
}: ICommonPromptCardProps) {
  const icon = useMemo(() => {
    switch (type) {
      case PromptCardType.LOADING:
        return <Loading width={20} height={20} isDarkThemeWhiteLoading />;
      case PromptCardType.SUCCESS:
        return <CustomSvg style={{ width: 20, height: 20 }} type="CheckCircle" />;
      case PromptCardType.WARNING:
        return <CustomSvg style={{ width: 20, height: 20 }} type="WarningInfoFilled" />;
      case PromptCardType.ERROR:
        return <CustomSvg style={{ width: 20, height: 20 }} type="WarnRedBackground" />;
      case PromptCardType.INFO:
      default:
        return <CustomSvg style={{ width: 20, height: 20 }} type="InfoFilled" />;
    }
  }, [type]);

  return (
    <div className={clsx('portkey-ui-common-prompt-card', `portkey-ui-common-prompt-card-${type}`, className)}>
      <div className="portkey-ui-common-prompt-card-icon">{icon}</div>
      <div className="portkey-ui-common-prompt-card-content">
        {title && <div className="portkey-ui-common-prompt-card-title">{title}</div>}
        <div className="portkey-ui-common-prompt-card-description">{description}</div>
      </div>
    </div>
  );
}
