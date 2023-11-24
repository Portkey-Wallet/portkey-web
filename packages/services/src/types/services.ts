import {
  IActivityService,
  IAssetsService,
  ICommunityRecoveryService,
  IRampService,
  ITokenService,
  ITransactionService,
} from '.';

export interface IServices extends ICommunityRecoveryService {
  readonly communityRecovery: ICommunityRecoveryService;
  readonly ramp: IRampService;
  readonly assets: IAssetsService;
  readonly token: ITokenService;
  readonly transaction: ITransactionService;
  readonly activity: IActivityService;
}
