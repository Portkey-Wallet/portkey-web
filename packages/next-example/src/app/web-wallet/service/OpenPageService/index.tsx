import { randomId } from '@portkey/utils';
import { eventBus } from '../../utils/lib';
import { IOpenPageParams, IPageState } from '../../context/types';
import { PortkeyResultType } from '../../types/error';
import { WalletPageType } from '../../types';

export enum SetPageEvent {
  OPEN_PAGE = 'OPEN_PAGE',
  CLOSE_PAGE = 'CLOSE_PAGE',
}

export class OpenPageService {
  static openPage(params: IOpenPageParams): Promise<PortkeyResultType> {
    return new Promise(async resolve => {
      const eventName = `${SetPageEvent.OPEN_PAGE}_${randomId()}`;
      eventBus.once(eventName, resolve);
      eventBus.emit(SetPageEvent.OPEN_PAGE, {
        ...params,
        eventName,
      });
    });
  }
  static closePage(eventName: string) {
    eventBus.emit(eventName, { error: 0 });
    eventBus.emit(SetPageEvent.OPEN_PAGE, {
      eventName,
      pageType: WalletPageType.Assets,
    });
  }
  static onOpenPage(callback: (params: IPageState) => void) {
    eventBus.addListener(SetPageEvent.OPEN_PAGE, callback);
  }
  static removeOpenPageListener(callback: (params: IPageState) => void) {
    eventBus.removeListener(SetPageEvent.OPEN_PAGE, callback);
  }
}
