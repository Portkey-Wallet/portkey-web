import { describe, expect, test } from '@jest/globals';
import FetchRequestMock from './__mocks__/request';
import { Services } from '../src/service';

// jest.mock('./request');

const request = new FetchRequestMock({});

describe('Services describe', () => {
  test('test fetchTconstructorxFee', async () => {
    const services = new Services(request, {} as any, {} as any);

    expect(services).toHaveProperty('communityRecovery');
    expect(services).toHaveProperty('ramp');
    expect(services).toHaveProperty('assets');
    expect(services).toHaveProperty('token');
  });
});
