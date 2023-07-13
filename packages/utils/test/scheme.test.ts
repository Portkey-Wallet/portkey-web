import { describe, expect, test } from '@jest/globals';
import { formatScheme } from '../src/scheme';

describe('scheme describe', () => {
  test('test formatScheme', () => {
    const link = formatScheme({
      action: 'linkDapp',
      domain: 'domain',
      custom: { url: 'url' },
    });
    expect(link).toEqual('portkey.did://domain/linkDapp?url=url');
  });
});
