'use client';
import React, { useCallback } from 'react';
import qs from 'query-string';

export default function Index() {
  const onSuccess = useCallback(() => {
    const params = qs.parse(window.location.search) as any;

    window.parent.postMessage(
      {
        type: 'PortkeyAchNFTCheckoutOnSuccess',
        data: params,
        target: '@portkey/ui-did-react:ACH_NFT_CHECKOUT',
      },
      '*',
    );
  }, []);

  return (
    <div>
      <button onClick={onSuccess}>click</button>
      <button
        onClick={() => {
          console.log(window.innerWidth, 'window.innerWidth');
        }}>
        click
      </button>
    </div>
  );
}
