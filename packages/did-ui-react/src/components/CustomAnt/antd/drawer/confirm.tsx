import { render as reactRender, unmount as reactUnmount } from 'rc-util/lib/React/render';
import Drawer, { DrawerProps } from './index';
import destroyFns from '../../utils/destroyFns';
export interface DrawerFuncProps extends Omit<DrawerProps, 'visible'> {
  onCancel?: (...args: any[]) => any;
  afterClose?: () => void;
}
export type DrawerConfigUpdate = DrawerFuncProps | ((prevConfig: DrawerFuncProps) => DrawerFuncProps);

export type DrawerFunc = (props: DrawerProps) => {
  destroy: () => void;
  // DrawerConfigUpdate
  update: (configUpdate: DrawerConfigUpdate) => void;
};

export default function confirm(config: DrawerFuncProps) {
  const container = document.createDocumentFragment();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  let currentConfig = { ...config, close, open: true } as any;
  let timeoutId: NodeJS.Timeout;

  function destroy(...args: any[]) {
    const triggerCancel = args.some((param) => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(() => {
        //
      }, ...args.slice(1));
    }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }

    reactUnmount(container);
  }

  function render({ ...props }: any) {
    clearTimeout(timeoutId);
    /**
     * https://github.com/ant-design/ant-design/issues/23623
     *
     * Sync render blocks React event. Let's make this async.
     */
    timeoutId = setTimeout(() => {
      reactRender(<Drawer {...props} />, container);
    });
  }

  function close(...args: any[]) {
    currentConfig = {
      ...currentConfig,
      open: false,
      afterClose: () => {
        if (typeof config.afterClose === 'function') {
          config.afterClose();
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        destroy.apply(this, args);
      },
    };

    // Legacy support
    if (currentConfig.visible) {
      delete currentConfig.visible;
    }

    render(currentConfig);
  }

  function update(configUpdate: DrawerConfigUpdate) {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig);
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate,
      };
    }
    render(currentConfig);
  }

  render(currentConfig);

  destroyFns.push(close);

  return {
    destroy: close,
    update,
  };
}
