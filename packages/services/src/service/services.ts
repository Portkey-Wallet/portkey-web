import { IBaseRequest, IExtraInfoConfig, IReferralConfig } from '@portkey/types';
import { IServices } from '../types/services';
import {
  ICommunityRecoveryService,
  IRampService,
  IAssetsService,
  ITokenService,
  ITransactionService,
  IActivityService,
  ISecurityService,
  IAllowanceService,
  TCommonService,
  IReceiveService,
} from '../types';
import { IDIDGraphQL } from '@portkey/graphql';
import { CommunityRecovery } from './communityRecovery';
import { Ramp } from './ramp';
import { Assets } from './assets';
import { Token } from './token';
import { Transaction } from './transaction';
import { Activity } from './activity';
import { Security } from './security';
import { Allowance } from './allowance';
import { Common } from './common';
import { Receive } from './receive';

export class Services<T extends IBaseRequest = IBaseRequest> extends CommunityRecovery<T> implements IServices {
  readonly communityRecovery: ICommunityRecoveryService;
  readonly ramp: IRampService;
  readonly assets: IAssetsService;
  readonly token: ITokenService;
  readonly transaction: ITransactionService;
  readonly activity: IActivityService;
  readonly security: ISecurityService;
  readonly allowance: IAllowanceService;
  readonly common: TCommonService;
  readonly receive: IReceiveService;
  constructor(request: T, didGraphQL: IDIDGraphQL, referralConfig: IReferralConfig, extraInfoConfig: IExtraInfoConfig) {
    super(request, didGraphQL, referralConfig, extraInfoConfig);
    this.communityRecovery = new CommunityRecovery(request, didGraphQL, referralConfig, extraInfoConfig);
    this.ramp = new Ramp(request);
    this.assets = new Assets(request);
    this.token = new Token(request);
    this.transaction = new Transaction(request);
    this.activity = new Activity(request);
    this.security = new Security(request);
    this.allowance = new Allowance(request);
    this.common = new Common(request);
    this.receive = new Receive(request);
  }
}
