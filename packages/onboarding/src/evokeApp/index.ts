/**
 * @remakes https://github.com/suanmei/callapp-lib
 */
import * as Browser from '../browser';
import { evokeByLocation, evokeByIFrame, checkOpen, evokeByTagA } from './evoke';
import * as generate from './generate';
import { EvokeAppConfig, EvokeAppOptions } from './types';

export class EvokeApp {
  private readonly options: EvokeAppOptions & { timeout: number };

  // Create an instance of EvokeApp
  constructor(options: EvokeAppOptions) {
    const defaultOptions = { timeout: 4000 };
    this.options = Object.assign(defaultOptions, options);
  }

  /**
   * register as method
   * generateScheme | generateIntent | generateUniversalLink  | checkOpen
   */
  public generateScheme(config: EvokeAppConfig): string {
    return generate.generateScheme(config, this.options);
  }

  public generateIntent(config: EvokeAppConfig): string {
    return generate.generateIntent(config, this.options);
  }

  public generateUniversalLink(config: EvokeAppConfig): string {
    return generate.generateUniversalLink(config, this.options);
  }

  checkOpen() {
    const { logFunc, timeout } = this.options;
    return new Promise((resolve, reject) => {
      checkOpen(status => {
        logFunc?.(status);
        if (status === 'success') return resolve(status);
        reject(status);
      }, timeout);
    });
  }

  // Call terminal failure jump app store
  fallToAppStore(): void {
    this.checkOpen().catch(() => evokeByLocation(this.options.appStore));
  }

  // Redirect to the general (download) page if the terminal call fails
  fallToFbUrl(): void {
    this.checkOpen().catch(() => {
      if (!this.options.fallback) return;
      evokeByLocation(this.options.fallback);
    });
  }

  // Failed to call the terminal to call the custom callback function
  fallToCustomCb(callback: () => void): void {
    this.checkOpen().catch(callback);
  }

  /**
   * Evoke the client
   * Execute different call-out strategies according to different browsers
   */
  open(config: EvokeAppConfig): void {
    const { universal, logFunc, intent } = this.options;
    const { callback } = config;
    const supportUniversal = typeof universal !== 'undefined';
    const schemeURL = this.generateScheme(config);
    let checkOpenFall;

    if (typeof logFunc !== 'undefined') {
      logFunc('pending');
    }
    if (Browser.isIos) {
      if (Browser.getIOSVersion() < 9) {
        evokeByIFrame(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else if (!supportUniversal) {
        evokeByTagA(schemeURL);
        checkOpenFall = this.fallToAppStore;
      } else {
        evokeByLocation(this.generateUniversalLink(config));
      }
      // Android
    } else if (Browser.isOriginalChrome) {
      if (typeof intent !== 'undefined') {
        evokeByLocation(this.generateIntent(config));
      } else {
        // The scheme cannot pull up the iframe normally on the android chrome25+ version
        evokeByLocation(schemeURL);
        checkOpenFall = this.fallToFbUrl;
      }
    } else {
      evokeByIFrame(schemeURL);
      checkOpenFall = this.fallToFbUrl;
    }

    if (typeof callback !== 'undefined') {
      this.fallToCustomCb(callback);
      return;
    }

    if (!checkOpenFall) return;

    checkOpenFall.call(this);
  }
}
