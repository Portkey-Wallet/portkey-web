import * as React from 'react';
import type { ValidateMessages } from 'rc-field-form/lib/interface';
import type { RequiredMark } from 'antd/lib/form/Form';
import type { Locale } from 'antd/lib/locale-provider';
import type { RenderEmptyHandler } from 'antd/lib/config-provider/defaultRenderEmpty';
import type { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface Theme {
  primaryColor?: string;
  infoColor?: string;
  successColor?: string;
  processingColor?: string;
  errorColor?: string;
  warningColor?: string;
}

export interface CSPConfig {
  nonce?: string;
}

export type DirectionType = 'ltr' | 'rtl' | undefined;

export interface ConfigConsumerProps {
  getTargetContainer?: () => HTMLElement;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  rootPrefixCls?: string;
  iconPrefixCls?: string;
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string;
  renderEmpty?: RenderEmptyHandler;
  csp?: CSPConfig;
  autoInsertSpaceInButton?: boolean;
  input?: {
    autoComplete?: string;
  };
  pagination?: {
    showSizeChanger?: boolean;
  };
  locale?: Locale;
  pageHeader?: {
    ghost: boolean;
  };
  direction?: DirectionType;
  space?: {
    size?: SizeType | number;
  };
  virtual?: boolean;
  dropdownMatchSelectWidth?: boolean;
  form?: {
    validateMessages?: ValidateMessages;
    requiredMark?: RequiredMark;
    colon?: boolean;
  };
}

const defaultGetPrefixCls = (suffixCls?: string, customizePrefixCls?: string) => {
  if (customizePrefixCls) return customizePrefixCls;

  return suffixCls ? `portkey-ant-${suffixCls}` : 'portkey-ant';
};

// zombieJ: 🚨 Do not pass `defaultRenderEmpty` here since it will case circular dependency.
export const ConfigContext = React.createContext<ConfigConsumerProps>({
  // We provide a default function for Context without provider
  getPrefixCls: defaultGetPrefixCls,
});

export const ConfigConsumer = ConfigContext.Consumer;

// =========================== withConfigConsumer ===========================
interface BasicExportProps {
  prefixCls?: string;
}

interface ConsumerConfig {
  prefixCls: string;
}

interface ConstructorProps {
  displayName?: string;
}

/** @deprecated Use hooks instead. This is a legacy function */
export function withConfigConsumer<ExportProps extends BasicExportProps>(config: ConsumerConfig) {
  return function withConfigConsumerFunc<ComponentDef>(
    Component: React.ComponentType<ExportProps>,
  ): React.FC<ExportProps> & ComponentDef {
    // Wrap with ConfigConsumer. Since we need compatible with react 15, be care when using ref methods
    const SFC = ((props: ExportProps) => (
      <ConfigConsumer>
        {(configProps: ConfigConsumerProps) => {
          const { prefixCls: basicPrefixCls } = config;
          const { getPrefixCls } = configProps;
          const { prefixCls: customizePrefixCls } = props;
          const prefixCls = getPrefixCls(basicPrefixCls, customizePrefixCls);
          return <Component {...configProps} {...props} prefixCls={prefixCls} />;
        }}
      </ConfigConsumer>
    )) as React.FC<ExportProps> & ComponentDef;

    const cons: ConstructorProps = Component.constructor as ConstructorProps;
    const name = (cons && cons.displayName) || Component.name || 'Component';

    if (process.env.NODE_ENV !== 'production') {
      SFC.displayName = `withConfigConsumer(${name})`;
    }
    return SFC;
  };
}
