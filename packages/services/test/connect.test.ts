import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Connect } from '../src/service/connect';

const request = new FetchRequestMock({});
const connect = new Connect(request);

describe('connect describe', () => {
  test('test getConnectToken', async () => {
    const result = await connect.getConnectToken({} as any);
    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('token_type');
    expect(result).toHaveProperty('expires_in');
  });
});
