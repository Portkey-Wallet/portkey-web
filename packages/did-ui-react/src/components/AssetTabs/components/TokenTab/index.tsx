import { TokenItemShowType } from '../../../types/assets';
import { divDecimals, formatAmountShow, transNetworkText } from '../../../../utils/converter';
import BigNumber from 'bignumber.js';
import CheckFetchLoading from '../../../CheckFetchLoading';
import TokenImageDisplay from '../../../TokenImageDisplay';
import './index.less';
import { Col, Collapse, Row } from 'antd';
import CustomSvg from '../../../CustomSvg';
import { useCallback, useState } from 'react';

export default function TokenTab({
  isMainnet,
  tokenList,
  onViewTokenItem,
}: {
  isMainnet?: boolean;
  tokenList?: TokenItemShowType[];
  onViewTokenItem?: (v: TokenItemShowType) => void;
}) {
  const [openPanel, setOpenPanel] = useState<string[]>([]);
  const handleChange = useCallback(
    (arr: string[] | string) => {
      console.log('arr is:', arr);
      const openArr = typeof arr === 'string' ? [arr] : arr;
      setOpenPanel(openArr);
    },
    [setOpenPanel],
  );
  const renderItem = useCallback(
    (item: ITokenSectionResponse, index: number) => {
      return (
        <Collapse.Panel
          key=""
          header={
            <li
              className="token-list-item flex-row-center"
              key={`${item.label}_${item.symbol}`}
              // onClick={() => onNavigate(item)}
            >
              <TokenImageDisplay width={36} symbol={item.symbol} src={item.imageUrl} />
              <div className="token-desc">
                <div className="info flex-between">
                  <span>{item.label ?? item.symbol}</span>
                  <span>{getTokenAmount(item)}</span>
                </div>
                <div className="amount flex-between">
                  {!!item.price && isMainnet && <span>${item.price}</span>}
                  {getAmountUSDShow(item)}
                </div>
              </div>
              <div
                className={
                  openPanel.includes(index.toString()) ? 'more-wrapper' : 'more-wrapper more-wrapper-transparent'
                }>
                <CustomSvg
                  // className={openPanel.includes(index.toString()) ? 'is-active' : ''}
                  type={openPanel.includes(index.toString()) ? 'ActiveMore' : 'InteractiveMore'}
                />
              </div>
            </li>
          }>
          {/* <span>{transNetworkText(item.chainId, !isMainnet)}</span> */}

          <div className="item-wrapper">
            {/* {item.tokens.map((tokenItem) => {
             return (<div className="container">
              <Row className="row">
                <Col className="text" span={12}>
                  MainChain AELF
                </Col>
                <Col className="amount-container" span={12}>
                  <div className="amount">2,000</div>
                  <CustomSvg type="NewRightArrow" />
                </Col>
              </Row>
            </div>);
            }} */}
            {item?.tokens?.map((tokenItem, index) => (
              <div
                className="container"
                style={{ marginTop: index !== 0 ? 4 : 0 }}
                key={`${tokenItem.symbol}_${index}`}
                onClick={() => onNavigate(tokenItem)}>
                <Row className="row">
                  <Col className="text" span={12}>
                    {transNetworkText(tokenItem.chainId, !isMainnet)}
                  </Col>
                  <Col className="amount-container" span={12}>
                    <div className="amount">{getTokenAmount(tokenItem)}</div>
                    <CustomSvg type="NewRightArrow" />
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Collapse.Panel>
      );
    },
    [getAmountUSDShow, getTokenAmount, isMainnet, onNavigate, openPanel],
  );
  return (
    <>
      <ul className="portkey-ui-token-list">
        {typeof tokenList === 'undefined' ? (
          <CheckFetchLoading list={tokenList} />
        ) : (
          <Collapse onChange={handleChange}>{tokenList.map((item, index) => renderItem(item, index))}</Collapse>

          // tokenList?.map((item) => (
          //   <li
          //     className="token-list-item"
          //     key={`${item.chainId}_${item.symbol}`}
          //     onClick={() => onViewTokenItem?.(item)}>
          //     <TokenImageDisplay src={item.imageUrl} symbol={item.symbol} />

          //     <div className="desc">
          //       <div className="info">
          //         <span>{item?.label || item.symbol}</span>
          //         <span>{formatAmountShow(divDecimals(item.balance, item.decimals))}</span>
          //       </div>
          //       <div className="amount">
          //         <p>{transNetworkText(item.chainId, isMainnet)}</p>
          //         {isMainnet && item.balanceInUsd && (
          //           <p className="convert">{`$ ${formatAmountShow(item.balanceInUsd)}`}</p>
          //         )}
          //       </div>
          //     </div>
          //   </li>
          // ))
        )}
      </ul>
    </>
  );
}
