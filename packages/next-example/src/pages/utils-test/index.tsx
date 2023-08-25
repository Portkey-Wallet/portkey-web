import { EvokeApp, Browser, evokePortkeyApp, checkPortkeyExtension } from '@portkey/onboarding';
import { scheme } from '@portkey/utils';
import { message } from 'antd';
import { useState } from 'react';

export default function AppleAuth() {
  const [status, setStatus] = useState<string>();
  return (
    <div>
      <div>1&nbsp;</div>
      <button
        onClick={() => {
          evokePortkeyApp({
            action: 'login',
            custom: {},
            onStatusChange: status => {
              message.error(status);
              setStatus(status);
            },
          });
          message.warning('evokePortkeyApp');
        }}>
        evokePortkeyApp
      </button>

      {status}

      <div></div>

      <button
        onClick={async () => {
          const result = await checkPortkeyExtension();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        button
      </button>
    </div>
  );
}
