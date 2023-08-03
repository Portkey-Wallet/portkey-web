import { IAssetsService, ICommunityRecoveryService, IRampService } from '.';

export interface IServices extends ICommunityRecoveryService {
  readonly communityRecovery: ICommunityRecoveryService;
  readonly ramp: IRampService;
  readonly assets: IAssetsService;
}
