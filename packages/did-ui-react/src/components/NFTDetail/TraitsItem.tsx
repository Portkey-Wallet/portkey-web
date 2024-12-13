import React, { memo } from 'react';
import { Typography, Card } from 'antd';
import './TraitsItem.less';

const { Text } = Typography;

interface TraitsProps {
  traitType: string;
  value: string;
  percent: string;
}

const TraitsItem: React.FC<TraitsProps> = ({ traitType, value, percent }) => {
  return (
    <Card className={'traits-item-container'} bordered={true}>
      <Text className={'traitType'} ellipsis={{ tooltip: traitType }}>
        {traitType}
      </Text>
      <Text className={'value'} ellipsis={{ tooltip: value }}>
        {value}
      </Text>
      <div className={'flexSpacer'} />
      <Text className={'percent'}>{percent}</Text>
    </Card>
  );
};

export default memo(TraitsItem);
