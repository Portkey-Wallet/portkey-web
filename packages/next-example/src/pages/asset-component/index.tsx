import { ConfigProvider, PortkeyAssetProvider, ReceiveCard, Send, Transaction } from '@portkey/did-ui-react';
import React, { useMemo } from 'react';
import { message } from 'antd';
import { ActivityItemType } from '@portkey/types';

ConfigProvider.setGlobalConfig({
  requestDefaults: {
    timeout: 10000,
  },
});

export default function AssetComponent() {
  const transactionDetail: ActivityItemType = useMemo(
    () => ({
      nftInfo: null,
      listIcon:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9InRyYW5zZmVyIj4KPHBhdGggaWQ9InNoYXBlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOEMwIDEyLjQxODMgMy41ODE3MiAxNiA4IDE2QzEyLjQxODMgMTYgMTYgMTIuNDE4MyAxNiA4QzE2IDMuNTgxNzIgMTIuNDE4MyAwIDggMEMzLjU4MTcyIDAgMCAzLjU4MTcyIDAgOFpNMTUuMiA4QzE1LjIgMTEuOTc2NCAxMS45NzY0IDE1LjIgOCAxNS4yQzQuMDIzNTUgMTUuMiAwLjggMTEuOTc2NSAwLjggOEMwLjggNC4wMjM1NSA0LjAyMzU1IDAuOCA4IDAuOEMxMS45NzY0IDAuOCAxNS4yIDQuMDIzNTUgMTUuMiA4Wk0xMS42NDM4IDYuOTUxM0MxMS42NDQ0IDYuOTYxODkgMTEuNjQ0NyA2Ljk3MjU5IDExLjY0NDcgNi45ODMzNkMxMS42NDQ3IDcuMjQwMTMgMTEuNDYzMyA3LjQ0ODUyIDExLjIzOTggNy40NDg1Mkg0Ljc2MDI0QzQuNTM2NyA3LjQ0ODUyIDQuMzU1MjcgNy4yNDAxMyA0LjM1NTI3IDYuOTgzMzZDNC4zNTUyNyA2LjcyNjU5IDQuNTM2NyA2LjUxODIgNC43NjAyNCA2LjUxODJIMTAuMTE3OEw4Ljg3NjggNS4yNzcxNkM4LjY5NTM4IDUuMDk1NzQgOC42OTUzOCA0LjgwMDgzIDguODc2OCA0LjYxOTQyQzkuMDU4MjEgNC40MzgwMSA5LjM1MzEyIDQuNDM4MDEgOS41MzQ1MyA0LjYxOTQyTDExLjUwODcgNi41OTI2M0MxMS42MDY5IDYuNjkwOTEgMTEuNjUyIDYuODIyNDkgMTEuNjQzOCA2Ljk1MTNaTTQuMzU1MjcgOS4wMTY2NEM0LjM1NTI3IDkuMDI3NDEgNC4zNTU1OSA5LjAzODExIDQuMzU2MjIgOS4wNDg3QzQuMzQ4MDIgOS4xNzc1MSA0LjM5MzA1IDkuMzA5MDkgNC40OTEzMyA5LjQwNzM3TDYuNDY1NDcgMTEuMzgwNkM2LjY0Njg4IDExLjU2MiA2Ljk0MTc5IDExLjU2MiA3LjEyMzIgMTEuMzgwNkM3LjMwNDYyIDExLjE5OTIgNy4zMDQ2MiAxMC45MDQzIDcuMTIzMiAxMC43MjI4TDUuODgyMTYgOS40ODE4SDExLjIzOThDMTEuNDYzMyA5LjQ4MTggMTEuNjQ0NyA5LjI3MzQxIDExLjY0NDcgOS4wMTY2NEMxMS42NDQ3IDguNzU5ODcgMTEuNDYzMyA4LjU1MTQ4IDExLjIzOTggOC41NTE0OEg0Ljc2MDI0QzQuNTM2NyA4LjU1MTQ4IDQuMzU1MjcgOC43NTk4NyA0LjM1NTI3IDkuMDE2NjRaIiBmaWxsPSIjNUI4RUY0Ii8+CjwvZz4KPC9zdmc+Cg==',
      transactionId: '0fb966e3bdd7aebda5e96bb1dcce97642f301d148f9aac6ac2185da97861ac31',
      blockHash: '0dc162247bc7a69edd00deeb2c0e78fc45ebc0ce8e63ab822b8a4d214739052c',
      transactionType: 'CrossChainTransfer',
      transactionName: 'CrossChain Transfer',
      amount: '968000000',
      symbol: 'ELF',
      decimals: '8',
      status: 'MINED',
      timestamp: '1692769218',
      isReceived: false,
      from: '1689851083',
      to: null,
      fromAddress: 'krC89jsfJgBK9PNakYeeFapvaJHBwMS7oyj1fRDSKpwrwECrX',
      toAddress: 'NRMRvewuaidMJMtfz1sHb8XGXWqMhxiBuork1wTYKk9zeSuS6',
      fromChainId: 'AELF',
      toChainId: 'tDVV',
      transactionFees: [
        {
          symbol: 'ELF',
          fee: 28760000,
          feeInUsd: '0.0874304696821862',
          decimals: '8',
        },
      ],
      priceInUsd: '0.3040002422885471',
      isDelegated: false,
    }),
    [],
  );
  return (
    <>
      <PortkeyAssetProvider pin="111111" originChainId="AELF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridGap: 10 }}>
          <Send
            wrapperStyle={{ height: 600, border: '1px solid gray' }}
            assetItem={{
              chainId: 'AELF',
              symbol: 'ELF',
              address: 'krC89jsfJgBK9PNakYeeFapvaJHBwMS7oyj1fRDSKpwrwECrX',
              tokenInfo: {
                balance: '894586679959',
                decimals: '8',
                balanceInUsd: '2676.59440057053',
                tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
              },
              nftInfo: null,
            }}
            onCancel={() => {
              console.log('Send onCancel');
            }}
            onSuccess={() => {
              message.success('Send success');
            }}
            onClose={() => {
              console.log('Send onClose');
            }}
          />
          <ReceiveCard
            receiveInfo={{
              address: 'NRMRvewuaidMJMtfz1sHb8XGXWqMhxiBuork1wTYKk9zeSuS6',
              name: '',
            }}
            assetInfo={{
              symbol: 'ELF',
              tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
              chainId: 'tDVV',
              decimals: 8,
            }}
            networkType={'TESTNET'}
            chainId={'tDVV'}
          />
          <Transaction
            transactionDetail={transactionDetail}
            caAddressInfos={[
              {
                chainId: 'AELF',
                caAddress: 'xxxxx',
              },
            ]}
            onClose={() => {
              message.error('Close');
            }}
          />
        </div>
      </PortkeyAssetProvider>
    </>
  );
}
