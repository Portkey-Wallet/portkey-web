import './index.less';
import { SwapForm } from './SwapForm';

import { useCallback, useMemo, useState } from 'react';
import { SwapSettingButton } from './components/SwapSettingButton';
import { SwapPreview, TSwapPreviewProps } from './SwapPreview';
import clsx from 'clsx';
import { SwapCompleted } from './SwapCompleted';

import { AWAKEN_HELP_URL } from '../../constants/awaken';
import CustomSvg from '../CustomSvg';
import TitleWrapper from '../TitleWrapper';
import React from 'react';

export enum SwapTypeEnum {
  'SwapForm' = 'SwapForm',
  'SwapPreview' = 'SwapPreview',
  'SwapCompleted' = 'SwapCompleted',
}

export type TSwapProps = {
  onBack?: () => void;
};

export const Swap = ({ onBack }: TSwapProps) => {
  const [type, setType] = useState(SwapTypeEnum.SwapForm);
  const [previewProps, setPreviewProps] = useState<TSwapPreviewProps>();
  const onBackClick = useCallback(() => {
    if (type === SwapTypeEnum.SwapPreview) {
      setType(SwapTypeEnum.SwapForm);
      setPreviewProps(undefined);
      return;
    }
    onBack?.();
  }, [onBack, type]);

  const title = useMemo(() => (type === SwapTypeEnum.SwapForm ? 'Swap' : 'Preview'), [type]);

  const onFinish = useCallback((props: TSwapPreviewProps) => {
    setPreviewProps(props);
    setType(SwapTypeEnum.SwapPreview);
  }, []);

  const onPreviewFinish = useCallback(() => {
    setType(SwapTypeEnum.SwapCompleted);
  }, []);

  const onHelpClick = useCallback(() => {
    window.open(AWAKEN_HELP_URL, '_blank');
  }, []);

  const rightElement = useMemo(() => {
    switch (type) {
      case SwapTypeEnum.SwapForm:
        return <SwapSettingButton key="swapSettingButton" />;
      case SwapTypeEnum.SwapPreview:
        // TODO: swap svg
        return <CustomSvg fillColor="var(--sds-color-icon-default-default)" type="help" onClick={onHelpClick} />;
      default:
        return null;
    }
  }, [onHelpClick, type]);

  return (
    <div className="swap-page">
      {type !== SwapTypeEnum.SwapCompleted && (
        <div className="swap-common-padding">
          <TitleWrapper
            className="swap-page-header"
            leftElement={
              <CustomSvg
                className="swap-page-header-back-icon"
                fillColor="var(--sds-color-icon-default-default)"
                type={'BackLeft'}
              />
            }
            title={title}
            leftCallBack={onBackClick}
            rightElement={rightElement}
          />
        </div>
      )}

      <div className="swap-page-body">
        <SwapForm className={clsx(type !== SwapTypeEnum.SwapForm && 'swap-form-hidden')} onFinish={onFinish} />

        {previewProps && type === SwapTypeEnum.SwapPreview && (
          <SwapPreview {...previewProps} onFinish={onPreviewFinish} />
        )}

        {type === SwapTypeEnum.SwapCompleted && <SwapCompleted />}
      </div>
    </div>
  );
};

export default Swap;
