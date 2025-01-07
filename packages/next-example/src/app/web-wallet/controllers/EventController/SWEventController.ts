/**
 * @remarks
 * The controller that handles the event
 * chainChanged, accountsChanged, networkChanged, disconnected, connected
 */
import {
  ChainIds,
  Accounts,
  DappEvents,
  ConnectInfo,
  IResponseType,
  ResponseCode,
  ProviderErrorType,
  // NotificationEvents,
} from '@portkey/provider-types';

import { isNotificationEvents } from '@portkey/providers';
import { eventBus } from '../../utils/lib';
import { WEB_WALLET_DISPATCH_EVENT } from '../../constants/events';

export interface DappEventPack<T = DappEvents, D = any> {
  eventName: T;
  data?: D;
  origin?: string;
}

export default class SWEventController {
  public static checkEventMethod(eventName: string): boolean {
    return isNotificationEvents(eventName);
  }

  public static checkDispatchEventParams(data: DappEventPack): boolean {
    if (!data) return false;
    return true;
  }

  public static check(eventName: string, data: any): boolean {
    return SWEventController.checkEventMethod(eventName) && SWEventController.checkDispatchEventParams(data);
  }

  public static dispatchEvent(params: DappEventPack): void;
  public static dispatchEvent(params: DappEventPack<'chainChanged', ChainIds>): void;
  public static dispatchEvent(params: DappEventPack<'accountsChanged', Accounts>): void;
  // public static dispatchEvent(params: DappEventPack<'networkChanged', NetworkType>): void;
  public static dispatchEvent(params: DappEventPack<'connected', ConnectInfo>): void;
  public static dispatchEvent(params: DappEventPack<'disconnected', ProviderErrorType>): void;
  static async dispatchEvent({ eventName, data, origin }: DappEventPack) {
    const event: IResponseType = {
      eventName,
      info: {
        code: ResponseCode.SUCCESS,
        data,
      },
      origin,
    };
    eventBus.emit(WEB_WALLET_DISPATCH_EVENT, event);
  }
}
