import { IAssetsService, ICommunityRecoveryService, IRampService, ITokenService } from '.';

export interface IServices extends ICommunityRecoveryService {
  readonly communityRecovery: ICommunityRecoveryService;
  readonly ramp: IRampService;
  readonly assets: IAssetsService;
  readonly token: ITokenService;
}
