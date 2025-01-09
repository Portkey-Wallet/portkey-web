import { SendResponseParams } from '../types';
import OpenPageService from '../service/OpenPageService';

export default class ApprovalController {
  constructor() {}

  /**
   * Obtain authorization to send transactions
   *
   */
  // // TODO format params
  // async authorizedToSendTransactions(params: {
  //   origin: string;
  //   transactionInfoId: string;
  //   payload: any;
  // }): Promise<SendResponseParams> {
  //   return this.notificationService.openPrompt({
  //     method: PromptRouteTypes.SEND_TRANSACTION,
  //     search: JSON.stringify(params),
  //   });
  // }

  // /**
  //  * Obtain authorization to get signature
  //  *
  //  */
  // async authorizedToGetSignature(
  //   params: any,
  //   autoSha256 = false,
  //   isManagerSignature = false,
  // ): Promise<SendResponseParams> {
  //   return this.notificationService.openPrompt({
  //     method: PromptRouteTypes.GET_SIGNATURE,
  //     search: JSON.stringify({ ...params, autoSha256, isManagerSignature }),
  //   });
  // }

  // /**
  //  * Obtain authorization to  auto execute
  //  *
  //  */
  // async authorizedToAutoExecute(params: any): Promise<SendResponseParams> {
  //   return this.notificationService.openPrompt(
  //     {
  //       method: PromptRouteTypes.AUTO_EXECUTE_TX,
  //       search: JSON.stringify(params),
  //     },
  //     'windows',
  //     {
  //       state: 'minimized',
  //     },
  //   );
  // }

  // /**
  //  * Obtain authorization to  auto execute
  //  *
  //  */
  // async authorizedToAllowanceApprove(params: any): Promise<SendResponseParams> {
  //   return this.notificationService.openPrompt(
  //     {
  //       method: PromptRouteTypes.ALLOWANCE_APPROVE,
  //       search: JSON.stringify(params),
  //     },
  //     'tabs',
  //   );
  // }

  // async authorizedToCheckWalletSecurity(params: any): Promise<SendResponseParams> {
  //   return this.notificationService.openPrompt(
  //     {
  //       method: PromptRouteTypes.WALLET_SECURITY_APPROVE,
  //       search: JSON.stringify(params),
  //     },
  //     'tabs',
  //   );
  // }
}
