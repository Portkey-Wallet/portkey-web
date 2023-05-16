import { appleAuthIdToken } from '@portkey/did-ui-react';
import React from 'react';

export default function index() {
  return (
    <div>
      <button
        onClick={async () => {
          try {
            window.addEventListener('message', event => {
              console.log(event, 'event===');
            });
            document.addEventListener('AppleIDSignInOnSuccess', data => {
              console.log(data, 'AppleIDSignInOnSuccess===');
            });

            document.addEventListener('AppleIDSignInOnFailure', error => {
              console.log(error, 'AppleIDSignInOnFailure===');
            });

            const info = await appleAuthIdToken({
              clientId: process.env.NEXT_PUBLIC_APP_APPLE_ID || '',
              redirectURI: 'https://localtest-applesign.portkey.finance', //'https://localtest-applesign.portkey.finance' || '',
              usePopup: true,
              state: 'i7LTiwOJjCHVeb_HlTXshbs36aTKngSL6rSy6xVUpDu',
            });
            // https://appleid.apple.com/auth/authorize?client_id=did.portkey&redirect_uri=https%3A%2F%2Flocaltest-applesign.portkey.finance%2Fapi%2Fapp%2FappleAuth%2FbingoReceive&response_type=code%20id_token&state=i7LTiwOJjCHVeb_HlTXshbs36aTKngSL6rSy6xVUpDu&scope=name%20email&response_mode=web_message&frame_id=af5c8d3f-4d2e-408d-8071-73fb3dd81a03&m=11&v=1.5.4
            // const handleClick = () => {
            //   const oauthUrl =
            //     `https://appleid.apple.com/auth/authorize?client_id=${process.env.NEXT_PUBLIC_APP_APPLE_ID}&response_type=code%20id_token&` +
            //     `scope=name email&response_mode=form_post&` +
            //     `state=${'STATE'}&redirect_uri=${'https://localtest-applesign.portkey.finance'}&nonce=${Date.now()}`;
            //   const windowWidth = 450;
            //   const windowHeight = 600;
            //   const left = window.screen.width / 2 - windowWidth / 2;
            //   const top = window.screen.height / 2 - windowHeight / 2;
            //   window.open(
            //     oauthUrl,
            //     'Apple Sign-In',
            //     `menubar=no,location=no,scrollbars=no,status=` +
            //       `no,width=${windowWidth},height=${windowHeight},top=${top},left=${left}`,
            //   );
            // };
            // handleClick();
            // console.log(info, '=====info');
          } catch (error) {
            console.log(error, 'error====info');
          }
        }}>
        Apple Author
      </button>
    </div>
  );
}
