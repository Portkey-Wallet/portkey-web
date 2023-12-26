import { BaseGraphQL, CaHolderWithGuardian, IDIDGraphQL, IGraphQLClient } from '@portkey-v1/graphql';
import { GetCaHolderManagerInfoDto } from '@portkey-v1/graphql/dist/esm/did/__generated__/types';

class DIDGraphQLMock<T extends IGraphQLClient = IGraphQLClient> extends BaseGraphQL<T> implements IDIDGraphQL {
  protected _config?: any;
  protected readonly _client: T;

  constructor({ client }: { client: T; config?: any }) {
    super(client);
  }
  public async getHolderInfoByManager(
    _params: Required<Pick<GetCaHolderManagerInfoDto, 'manager' | 'chainId'>>,
  ): Promise<{ caHolderManagerInfo: CaHolderWithGuardian[] }> {
    return {
      caHolderManagerInfo: [
        {
          caAddress: 'caAddress_mock',
          caHash: 'caHash_mock',
          chainId: 'AELF',
          id: 'id_mock',
          managerInfos: [
            {
              address: 'address_mock',
              extraData: 'extraData_mock',
            },
          ],
          originChainId: 'originChainId_mock',
          loginGuardianInfo: [
            {
              caAddress: 'caAddress_mock',
              caHash: 'caHash_mock',
              chainId: 'AELF',
              id: 'id_mock',
              loginGuardian: {
                identifierHash: 'identifierHash_mock',
                isLoginGuardian: true,
                salt: 'salt_mock',
                type: 1,
                verifierId: 'verifierId_mock',
              },
              manager: 'manager_mock',
            },
          ],
        },
      ],
    };
  }
}

export default DIDGraphQLMock;
