import { randomId } from '@portkey/utils';
import { eventBus } from '../../utils/lib';
import { IOpenPageParams, IPageState } from '../../context/types';
import { PortkeyResultType } from '../../types/error';

export enum SetPageEvent {
  OPEN_PAGE = 'OPEN_PAGE',
  CLOSE_PAGE = 'CLOSE_PAGE',
}

export class OpenPageService {
  static openPage(params: IOpenPageParams): Promise<PortkeyResultType> {
    return new Promise(async resolve => {
      const eventName = `${SetPageEvent.OPEN_PAGE}_${randomId()}`;
      eventBus.once(eventName, data => {
        resolve(data);
      });
      eventBus.emit(SetPageEvent.OPEN_PAGE, {
        ...params,
        eventName,
      });
    });
  }
  static closePage(eventName: string, data: PortkeyResultType) {
    eventBus.emit(eventName, data);
    eventBus.emit(SetPageEvent.CLOSE_PAGE, data);
  }
  static onOpenPage(callback: (params: IPageState) => void) {
    eventBus.addListener(SetPageEvent.OPEN_PAGE, callback);
  }

  static onClosePage(callback: () => void) {
    eventBus.addListener(SetPageEvent.CLOSE_PAGE, callback);
  }
  static removeOpenPageListener(callback: (params: IPageState) => void) {
    eventBus.removeListener(SetPageEvent.OPEN_PAGE, callback);
  }
  static removeClosePageListener(callback: () => void) {
    eventBus.removeListener(SetPageEvent.CLOSE_PAGE, callback);
  }
}

export default OpenPageService;
