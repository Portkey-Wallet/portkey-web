'use client';
import React, { useCallback } from 'react';
import qs from 'query-string';
import { Button } from 'antd';
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
      <Button onClick={onSuccess}>click</Button>
      <Button
        onClick={() => {
          console.log(window.innerWidth, 'window.innerWidth');
        }}>
        click
      </Button>
    </div>
  );
}
