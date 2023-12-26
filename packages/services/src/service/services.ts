import { IBaseRequest } from '@portkey-v1/types';
import { IServices } from '../types/services';
import {
  ICommunityRecoveryService,
  IRampService,
  IAssetsService,
  ITokenService,
  ITransactionService,
  IActivityService,
  ISecurityService,
} from '../types';
import { IDIDGraphQL } from '@portkey-v1/graphql';
import { CommunityRecovery } from './communityRecovery';
import { Ramp } from './ramp';
import { Assets } from './assets';
import { Token } from './token';
import { Transaction } from './transaction';
import { Activity } from './activity';
import { Security } from './security';

export class Services<T extends IBaseRequest = IBaseRequest> extends CommunityRecovery<T> implements IServices {
  readonly communityRecovery: ICommunityRecoveryService;
  readonly ramp: IRampService;
  readonly assets: IAssetsService;
  readonly token: ITokenService;
  readonly transaction: ITransactionService;
  readonly activity: IActivityService;
  readonly security: ISecurityService;

  constructor(request: T, didGraphQL: IDIDGraphQL) {
    super(request, didGraphQL);
    this.communityRecovery = new CommunityRecovery(request, didGraphQL);
    this.ramp = new Ramp(request);
    this.assets = new Assets(request);
    this.token = new Token(request);
    this.transaction = new Transaction(request);
    this.activity = new Activity(request);
    this.security = new Security(request);
  }
}
