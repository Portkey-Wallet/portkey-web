import { DispatchParam, SandboxDispatchData, SandboxEventTypes } from './types';
import { randomId } from '../lib';
import { sleep } from '@portkey/utils';

export class SandboxEventService {
  static async dispatch(event: SandboxEventTypes, data?: any, eleId = 'sandbox') {
    let iframe = document.getElementById(eleId);
    if (!iframe) {
      await sleep(1000);
      iframe = document.createElement('iframe');
    }
    const sid = randomId();
    (iframe as any)?.contentWindow.postMessage(
      {
        event,
        data: { ...data, sid },
      },
      '*',
    );
    return { event, sid };
  }

  static dispatchToOrigin(event: MessageEvent<any>, data?: SandboxDispatchData) {
    event?.source?.postMessage({ ...data, eventName: event.data.event }, event.origin as any);
  }

  static listen({ event: eventName, sid }: { event: SandboxEventTypes; sid: string }): Promise<any> {
    return new Promise((resolve) => {
      window.addEventListener('message', (event) => {
        if (event.data.eventName === eventName && event.data.sid === sid) resolve(event.data);
      });
    });
  }
  /**
   *
   * @param event - SandboxEventTypes
   * @param data - when callView data is DispatchData, other any
   * @param ele - element id
   * @returns
   */
  static async dispatchAndReceive(event: SandboxEventTypes, data?: DispatchParam, eleId = 'sandbox') {
    const dispatchKey = await SandboxEventService.dispatch(event, data, eleId);
    return SandboxEventService.listen(dispatchKey);
  }
}
