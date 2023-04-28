import { BaseGraphQL, IGraphQLClient } from '../types';
import { CaHolderWithGuardian, IDIDGraphQL } from '../types/did';
import { getCAHolderManagerInfo, getLoginGuardianAccount } from './utils';
import { GetCaHolderManagerInfoDto } from './__generated__/types';

export class DIDGraphQL<T extends IGraphQLClient = IGraphQLClient> extends BaseGraphQL<T> implements IDIDGraphQL {
  // TODO IDID config
  protected _config?: any;
  protected readonly _client: T;

  constructor({ client, config }: { client?: T; config?: any }) {
    super(client as any);
    this._config = config;
  }
  public async getHolderInfoByManager(
    params: Partial<Omit<GetCaHolderManagerInfoDto, 'manager' | 'chainId'>> &
      Required<Pick<GetCaHolderManagerInfoDto, 'manager' | 'chainId'>>,
  ): Promise<{ caHolderManagerInfo: CaHolderWithGuardian[] }> {
    const client = this._config?.graphQLClient || this._client;
    const caResult = await getCAHolderManagerInfo(client, {
      dto: {
        skipCount: 0,
        maxResultCount: 1,
        ...params,
      },
    });

    if (caResult.error) throw caResult.error;
    const result: {
      caHolderManagerInfo: CaHolderWithGuardian[];
    } = {
      caHolderManagerInfo: caResult.data.caHolderManagerInfo
        ? caResult.data.caHolderManagerInfo.map(item => ({ ...item, loginGuardianInfo: [] }))
        : [],
    };

    if (result.caHolderManagerInfo.length > 0) {
      const caHash = result.caHolderManagerInfo[0].caHash;
      const guardianResult = await getLoginGuardianAccount(client, {
        dto: {
          chainId: params.chainId,
          caHash,
          skipCount: 0,
          maxResultCount: 100,
        },
      });

      if (guardianResult.error) throw guardianResult.error;

      if (guardianResult.data.loginGuardianInfo) {
        result.caHolderManagerInfo[0].loginGuardianInfo = guardianResult.data.loginGuardianInfo;
      } else {
        result.caHolderManagerInfo[0].loginGuardianInfo = [];
      }
    }

    return result;
  }
}
