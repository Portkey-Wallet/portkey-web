import { Col, Row } from 'antd';
import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { CSSProperties, ReactNode } from 'react';

export interface TitleWrapperProps {
  title?: ReactNode;
  className?: string;
  leftElement?: ReactNode | boolean;
  rightElement?: ReactNode;
  leftCallBack?: () => void;
  rightCallback?: () => void;
  titleStyle?: CSSProperties;
}

export default function TitleWrapper({
  title,
  className,
  leftElement,
  rightElement,
  titleStyle,
  leftCallBack,
  rightCallback,
}: TitleWrapperProps) {
  return (
    <Row justify="space-between" className={clsx(className)}>
      {leftElement && (
        <Col
          className="title-left-col"
          onClick={() => {
            if (typeof leftElement === 'boolean') return;
            leftCallBack?.();
          }}>
          {leftElement ? (
            leftElement
          ) : typeof leftElement === 'undefined' ? (
            <CustomSvg style={{ cursor: 'pointer' }} type="LeftArrow" />
          ) : null}
        </Col>
      )}
      <Col className="title-center" style={titleStyle}>
        {title}
      </Col>
      <Col className="title-right-col">
        <span onClick={rightCallback}>{rightElement || ''}</span>
      </Col>
    </Row>
  );
}
