import { IRampProviderType, RAMP_SOCKET_TIMEOUT, SELL_ORDER_DISPLAY_STATUS } from './constants';
import { AlchemyPayProvider, RampProvider, TransakProvider } from './provider';
import { AlchemyPayRampService, RampService } from './service';
import {
  IRampProviderMap,
  IRampSignalr,
  IRampService,
  IRampProvider,
  IGenerateTransaction,
  IOrderInfo,
  IRampConfig,
  IRampConfigOptions,
} from './types';
import { RampSignalr } from './signalr';
import { randomId } from '@portkey/utils';
import { FetchRequest } from '@portkey/request';
import { IBaseRequest } from '@portkey/types';
import { RampConfig } from './config';

export interface IBaseRamp {
  config: IRampConfig;
  fetchRequest: IBaseRequest;
  service: IRampService;
  rampSignalr: IRampSignalr;
  providerMap: IRampProviderMap;
  setConfig(option: IRampConfig): void;
  setProvider(provider: IRampProvider): void;
  getProvider(name: IRampProviderType): RampProvider | undefined;
  removeProvider(name: IRampProviderType): RampProvider | undefined;
  transferCrypto(orderId: string, generateTransaction: IGenerateTransaction): Promise<IOrderInfo>;
}

export abstract class BaseRamp implements IBaseRamp {
  public config: RampConfig;
  public fetchRequest: IBaseRequest;
  public service: IRampService;
  public rampSignalr: IRampSignalr;
  public providerMap: IRampProviderMap;

  constructor() {
    this.config = new RampConfig();
    this.fetchRequest = new FetchRequest(this.config.requestConfig);
    this.service = new RampService({
      fetchRequest: this.fetchRequest,
    });

    this.rampSignalr = new RampSignalr();
    this.providerMap = {};
  }

  public setConfig(option: IRampConfigOptions) {
    this.config.setConfig(option);
  }

  public setProvider(provider: IRampProvider) {
    this.providerMap[provider.providerInfo.key] = provider;
  }

  public getProvider(key: IRampProviderType) {
    return this.providerMap[key];
  }

  public removeProvider(key: IRampProviderType) {
    const provider = this.providerMap[key];
    delete this.providerMap[key];
    return provider;
  }

  public clearProvider() {
    this.providerMap = {};
  }

  async transferCrypto(orderId: string, generateTransaction: IGenerateTransaction): Promise<IOrderInfo> {
    const clientId = randomId();
    try {
      await this.rampSignalr.doOpen({
        url: this.config.requestConfig?.socketUrl || `${this.config.requestConfig.baseURL || ''}/ca`,
        clientId,
      });
    } catch (error) {
      console.log('rampSignalr.doOpen error: ', error);
    }

    let timer: NodeJS.Timeout | undefined = undefined;
    const timerPromise = new Promise<'timeout'>(resolve => {
      timer = setTimeout(() => {
        resolve('timeout');
      }, RAMP_SOCKET_TIMEOUT);
    });

    let signalFinishPromiseResolve: (value: IOrderInfo | PromiseLike<IOrderInfo | null> | null) => void;
    const signalFinishPromise = new Promise<IOrderInfo | null>(resolve => {
      signalFinishPromiseResolve = resolve;
    });

    let isTransferred = false;
    const { remove: removeAchTx } = this.rampSignalr.onRampOrderChanged(async data => {
      if (data.displayStatus === SELL_ORDER_DISPLAY_STATUS.TRANSFERRED) {
        signalFinishPromiseResolve(data);
        return;
      }

      if (data.displayStatus !== SELL_ORDER_DISPLAY_STATUS.CREATED) {
        return;
      }

      try {
        const result = await generateTransaction(data);
        await this.service.sendSellTransaction({
          merchantName: data.merchantName,
          orderId,
          rawTransaction: result.rawTransaction,
          signature: result.signature,
          publicKey: result.publicKey,
        });
        isTransferred = true;
      } catch (e) {
        signalFinishPromiseResolve(null);
        return;
      }
    });

    await this.rampSignalr.requestRampOrderStatus(clientId, orderId);
    const signalrSellResult = await Promise.race([timerPromise, signalFinishPromise]);

    removeAchTx();
    this.rampSignalr.stop();
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    if (signalrSellResult === null) throw new Error('Transaction failed.');
    if (signalrSellResult === 'timeout') {
      if (!isTransferred) throw new Error('Transaction failed.');
      throw {
        code: 'TIMEOUT',
        message: 'The waiting time is too long, it will be put on hold in the background.',
      };
    }
    return signalrSellResult;
  }
}

export class Ramp extends BaseRamp {
  constructor() {
    super();
  }

  async init(option: IRampConfigOptions) {
    this.setConfig(option);
    await this.refreshRampProvider();
  }

  async refreshRampProvider() {
    const {
      data: { thirdPart },
    } = await this.service.getRampInfo();

    this.clearProvider();

    Object.keys(thirdPart).forEach(key => {
      switch (key) {
        case IRampProviderType.AlchemyPay:
          this.setProvider(
            new AlchemyPayProvider({
              providerInfo: {
                key: IRampProviderType.AlchemyPay,
                ...thirdPart[IRampProviderType.AlchemyPay],
              },
              service: new AlchemyPayRampService({
                fetchRequest: this.fetchRequest,
              }),
            }),
          );
          break;

        case IRampProviderType.Transak:
          this.setProvider(
            new TransakProvider({
              providerInfo: { key: IRampProviderType.Transak, ...thirdPart[IRampProviderType.Transak] },
              service: new RampService({
                fetchRequest: this.fetchRequest,
              }),
            }),
          );
          break;

        default:
          break;
      }
    });
  }
}

const ramp = new Ramp();

export default ramp;

export * from './api';
export * from './config';
export * from './constants';
export * from './provider';
export * from './service';
export * from './signalr';
export * from './types';
export * from './utils';
