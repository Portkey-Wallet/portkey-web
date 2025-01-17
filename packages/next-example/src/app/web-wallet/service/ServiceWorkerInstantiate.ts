import PermissionController from '../controllers/PermissionController';
import { MethodsWallet, MethodsBase, NetworkType } from '@portkey/provider-types';
import { IRequestPayload } from '../types';
import { SendResponseFun } from './types';
import AELFMethodController from '../controllers/AELFMethodController';
import ApprovalController from '../controllers/ApprovalController';
import errorHandler from '../utils/errorHandler';
import { did } from '@portkey/did-ui-react';
import { getWebWalletStorageKey } from '../utils/wallet';
import SWEventController from '../controllers/EventController/SWEventController';

const permissionWhitelist = [
  MethodsWallet.GET_WALLET_STATE,
  // The method that requires the dapp not to trigger the lock call
  MethodsBase.ACCOUNTS,
  MethodsBase.CHAIN_ID,
  MethodsBase.CHAIN_IDS,
  MethodsBase.CHAINS_INFO,
];

// This is the script that runs in the extension's serviceWorker ( singleton )
export default class ServiceWorkerInstantiate {
  protected permissionController: PermissionController;
  protected aelfMethodController: AELFMethodController;
  protected approvalController: ApprovalController;
  protected pin: string | null = null;
  protected appId: string;
  protected networkType: NetworkType;

  constructor({ appId, networkType }: { appId: string; networkType: NetworkType }) {
    this.appId = appId;
    this.networkType = networkType;

    this.permissionController = new PermissionController({
      whitelist: permissionWhitelist,
      appId: this.appId,
    });
    // Controller that handles user authorization
    this.approvalController = new ApprovalController();
    this.aelfMethodController = new AELFMethodController({
      approvalController: this.approvalController,
      getPassword: () => this.pin,
      appId: this.appId,
      networkType: this.networkType,
    });
  }

  // Watches the internal messaging system ( LocalStream )
  async setupInternalMessaging(sendResponse: SendResponseFun, request: IRequestPayload) {
    try {
      // May not communicate via LocalStream.send
      if (!request.method) return;
      // if (SWEventController.check(message.type, message.payload?.data)) {
      //   const payload = message.payload;
      //   const data: DappEventPack['data'] = payload.data;
      //   const origin = payload.origin;
      //   SWEventController.dispatchEvent({ eventName: message.type as any, data, origin });
      //   sendResponse(errorHandler(0));
      //   return;
      // }

      const registerRes = await this.permissionController.checkRegister(request.method, request?.payload);
      console.log(registerRes, 'registerRes===');
      if (registerRes.error !== 0) return sendResponse(registerRes);
      const isLocked = await this.permissionController.checkIsLockOtherwiseUnlock(request.method);
      if (isLocked.error !== 0) return sendResponse(isLocked);

      this.dispenseMessage(sendResponse, request);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Delegates message processing to methods by message type
   * @param sendResponse - Delegating response handler
   * @param message - The message to be dispensed
   */
  dispenseMessage(sendResponse: SendResponseFun, message: IRequestPayload) {
    console.log('dispenseMessage: ', message);
    switch (message.method) {
      case MethodsWallet.WALLET_DISCONNECT:
        this.disconnect(sendResponse);
        break;

      default:
        if (this.aelfMethodController.aelfMethodList.includes(message.method)) {
          console.log('serviceWorker dispenseMessage ', message);
          this.aelfMethodController.dispenseMessage(message, sendResponse);
          break;
        }
        sendResponse(errorHandler(700001, `Portkey does not contain this method (${message.method})`));
        break;
    }
  }

  async disconnect(sendResponse: SendResponseFun) {
    if (did.didWallet.originChainId) {
      await did.logout(
        {
          chainId: did.didWallet.originChainId,
        },
        { onMethod: 'transactionHash' },
      );
      localStorage.removeItem(getWebWalletStorageKey(this.appId));
    }
    did.reset();
    SWEventController.dispatchEvent({
      eventName: 'disconnected',
      data: { code: 0, message: 'disconnect' },
    });
    sendResponse({ ...errorHandler(0), data: null });
  }
}
