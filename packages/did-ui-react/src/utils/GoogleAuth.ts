const JS_SRC = 'https://accounts.google.com/gsi/client';
const SCRIPT_ID = 'google-login';
let client: any = null;

interface GoogleAuthProps {
  scope?: string;
  prompt?: string;
  uxMode?: string;
  clientId: string;
  className?: string;
  loginHint?: string;
  accessType?: string;
  autoSelect?: boolean;
  redirectUri?: string;
  cookiePolicy?: string;
  hostedDomain?: string;
  discoveryDocs?: string;
  children?: React.ReactNode;
  isOnlyGetToken?: boolean;
  typeResponse?: 'idToken' | 'accessToken';
  fetchBasicProfile?: boolean;
  onReject: (reject: any) => void;
  onResolve: (data: any) => void;
}

const insertScriptGoogle = (d: Document, s = 'script', id: string, jsSrc: string) =>
  new Promise((resolve, reject) => {
    try {
      const ggScriptTag: any = d.createElement(s);
      ggScriptTag.id = id;
      ggScriptTag.src = jsSrc;
      ggScriptTag.async = true;
      ggScriptTag.defer = true;
      const scriptNode = document.getElementsByTagName('script')?.[0];
      scriptNode && scriptNode.parentNode && scriptNode.parentNode.insertBefore(ggScriptTag, scriptNode);
      ggScriptTag.onload = resolve;
    } catch (error) {
      reject(error);
    }
  });

const handleResponse = (res: Record<string, any>) => {
  try {
    if (res?.access_token) {
      return {
        provider: 'google',
        data: { ...res, accessToken: res.access_token },
      };
    } else {
      const data: Record<string, any> = res;
      return {
        data,
      };
    }
  } catch (error) {
    console.log(error, 'error===GoogleAuthGoogleAuth');
  }
};

const googleAccountsInit = ({
  client_id,
  ux_mode,
  auto_select,
}: {
  client_id: string;
  ux_mode?: string;
  auto_select?: boolean;
}) =>
  new Promise((resolve) => {
    const _window: any = window;
    const _handleResponse = (res: Record<string, any>) => {
      const data = handleResponse(res);
      resolve(data);
    };
    client = _window.google.accounts.id.initialize({
      client_id,
      ux_mode,
      auto_select,
      callback: _handleResponse,
    });
  });

const googleAccountsInitTokenClient = ({
  clientId,
  uxMode,
  scope,
  loginHint,
  accessType,
  prompt,
  hostedDomain,
  redirectUri,
  cookiePolicy,
  discoveryDocs,
  fetchBasicProfile,
  onResolve,
  onReject,
}: GoogleAuthProps) => {
  const _window: any = window;
  return new Promise((resolve) => {
    client = _window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      ux_mode: uxMode,
      scope,
      prompt,
      login_hint: loginHint,
      access_type: accessType,
      hosted_domain: hostedDomain,
      redirect_uri: redirectUri,
      cookie_policy: cookiePolicy,
      discoveryDocs,
      immediate: true,
      fetch_basic_profile: fetchBasicProfile,
      callback: onResolve,
      error_callback: onReject,
    });
    resolve(client);
  });
};

const loadGoogleSdk = async ({ clientId, uxMode, autoSelect, typeResponse, ...args }: GoogleAuthProps) => {
  if (!(window as any)?.google?.accounts) {
    await insertScriptGoogle(document, 'script', SCRIPT_ID, JS_SRC);
  }
  const params = {
    client_id: clientId,
    ux_mode: uxMode,
  };

  if (typeResponse === 'idToken') {
    return googleAccountsInit({
      ...params,
      auto_select: autoSelect,
    });
  } else {
    return googleAccountsInitTokenClient({
      clientId,
      ...params,
      ...args,
    });
  }
};

export const googleAuthAccessToken = async (
  props: Omit<GoogleAuthProps, 'typeResponse' | 'onReject' | 'onResolve'>,
): Promise<{ accessToken?: string } | undefined> => {
  if (typeof window === 'undefined') return;
  const _props: Omit<GoogleAuthProps, 'onReject' | 'onResolve'> = {
    prompt: 'select_account',
    typeResponse: 'accessToken',
    className: '',
    loginHint: '',
    accessType: 'online',
    redirectUri: '/',
    autoSelect: false,
    isOnlyGetToken: false,
    cookiePolicy: 'single_host_origin',
    hostedDomain: '',
    discoveryDocs: '',
    fetchBasicProfile: true,
    ...props,
    scope:
      'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile' +
      (props.scope ?? ''),
  };
  return new Promise(async (resolve, reject) => {
    function _handleResponse(res: any) {
      const data = res;
      data.accessToken = res.access_token;
      resolve(data);
    }
    await loadGoogleSdk({ ..._props, onResolve: _handleResponse, onReject: reject });
    if (client) client.requestAccessToken();
    else (window as any).google.accounts.id.prompt();
  });
};
