import { PortkeyStyleProvider, handleErrorMessage, singleMessage } from '@portkey/did-ui-react';
import { evokePortkey } from '@portkey/onboarding';
import { message, ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';

export default function AppleAuth() {
  const [status, setStatus] = useState<string>();
  return (
    <div>
      <div>--------</div>
      <button
        onClick={() => {
          evokePortkey.app({
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
      <div>--------</div>
      <button
        onClick={async () => {
          const result = await evokePortkey.extension();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        extension
      </button>
      <div>-----</div>
      <button
        onClick={async () => {
          const result = await evokePortkey.thirdParty();
          // message.error(navigator.userAgent);
          console.log(result, '=result==');
        }}>
        thirdParty
      </button>
      <div>-----</div>
      <button
        onClick={async () => {
          const VConsole = require('vconsole');
          new VConsole();
        }}>
        VConsole
      </button>
    </div>
  );
}
