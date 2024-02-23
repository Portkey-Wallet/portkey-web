import { describe, expect, test } from '@jest/globals';
import { formatScheme, V1_DID_APP_SCHEMA, DID_APP_SCHEMA } from '../src/scheme';

describe('scheme describe', () => {
  test('test formatScheme', () => {
    const link = formatScheme({
      action: 'linkDapp',
      domain: 'domain',
      custom: { url: 'url' },
    });
    expect(link).toEqual(`${DID_APP_SCHEMA}://domain/linkDapp?url=url`);
  });
  test('test v1 formatScheme', () => {
    const link = formatScheme({
      version: 'v1',
      action: 'linkDapp',
      domain: 'domain',
      custom: { url: 'url' },
    });
    expect(link).toEqual(`${V1_DID_APP_SCHEMA}://domain/linkDapp?url=url`);
  });
});
