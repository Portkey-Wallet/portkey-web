import {
  IActivityService,
  IAssetsService,
  ICommunityRecoveryService,
  IRampService,
  ISecurityService,
  ITokenService,
  ITransactionService,
} from './index';

export interface IServices extends ICommunityRecoveryService {
  readonly communityRecovery: ICommunityRecoveryService;
  readonly ramp: IRampService;
  readonly assets: IAssetsService;
  readonly token: ITokenService;
  readonly transaction: ITransactionService;
  readonly activity: IActivityService;
  readonly security: ISecurityService;
}
