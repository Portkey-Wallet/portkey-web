import { StringifiableRecord } from 'query-string';

export interface EvokeAppConfig<Params = StringifiableRecord> {
  path: string;
  param?: Params;
  callback?: () => void;
}

export interface EvokeAppOptions {
  scheme: {
    protocol: string;
    domain: string;
  };
  outChain?: {
    protocol: string;
    path: string;
    key: string;
  };
  intent?: Intent;
  universal?: {
    domain: string;
    pathKey?: string;
  };
  appStore: string;
  fallback?: string;
  timeout?: number;
  logFunc?: (status: 'pending' | 'failure' | 'success') => void;
  buildScheme?: (config: EvokeAppConfig, options: EvokeAppOptions) => string;
}

export interface Intent {
  package: string;
  scheme: string;
  action?: string;
  category?: string;
  component?: string;
}

export type Hidden = 'hidden' | 'webkitHidden' | 'msHidden' | undefined;

export type VisibilityChange = 'visibilitychange' | 'webkitvisibilitychange' | 'msvisibilitychange' | undefined;

export type OpenStatus = 'failure' | 'success';
