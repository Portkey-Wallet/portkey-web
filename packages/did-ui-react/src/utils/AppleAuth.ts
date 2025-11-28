const JS_SRC = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
const SCRIPT_ID = 'apple-login';
const insertScript = async (d: Document, s = 'script', id: string, jsSrc: string) =>
  new Promise((resolve, reject) => {
    try {
      const appleScriptTag: any = d.createElement(s);
      appleScriptTag.id = id;
      appleScriptTag.src = jsSrc;
      appleScriptTag.async = true;
      appleScriptTag.defer = true;
      const scriptNode = document.getElementsByTagName('script')?.[0];
      scriptNode && scriptNode.parentNode && scriptNode.parentNode.insertBefore(appleScriptTag, scriptNode);
      appleScriptTag.onload = resolve;
    } catch (error) {
      reject(error);
    }
  });

interface AppleAuthProps {
  clientId: string;
  scope?: string;
  redirectURI?: string;
  state?: string;
  usePopup?: boolean;
  nonce?: any;
}

const loadAppleSdk = async (props: AppleAuthProps) => {
  if (!(window as any)?.AppleID?.auth) {
    await insertScript(document, 'script', SCRIPT_ID, JS_SRC);
  }

  const options = {
    // clientId: props.clientId, // This is the service ID we created.
    scope: 'name email', // To tell apple we want the user name and emails fields in the response it sends us.
    // redirectURI, // As registered along with our service ID
    state: 'origin:web', // Any string of your choice that you may use for some logic. It's optional and you may omit it.
    usePopup: false, // Important if we want to capture the data apple sends on the client side.
    ...props,
  };
  (window as any).AppleID.auth.init(options);
};

export const appleAuthIdToken = async (props: AppleAuthProps): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof window === 'undefined') throw new Error('window is undefined');
      await loadAppleSdk(props);
      await (window as any).AppleID.auth.signIn();
      resolve(undefined);
    } catch (err) {
      reject?.(err);
    }
  });
};
