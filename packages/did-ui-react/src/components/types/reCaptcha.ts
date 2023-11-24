export type ReCaptchaResponseType = 'success' | 'error' | 'cancel' | 'expire';

export interface BaseReCaptcha {
  siteKey?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  customReCaptchaHandler?: () => Promise<{
    type: ReCaptchaResponseType;
    message?: any;
  }>;
}

export interface BaseReCaptchaHandler {
  onSuccess?: (result: string) => any;
  onExpire?: (e: any) => any;
  onError?: (e: any) => any;
  onCancel?: () => void;
}
