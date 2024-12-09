import { Progress, ProgressProps } from 'antd';
import { useMemo } from 'react';
import ConfigProvider from '../config-provider';
import './index.less';

export type ProgressLineType = {
  percent: number;
} & ProgressProps;

export default function ProgressLine(props: ProgressLineType) {
  const theme = useMemo(() => ConfigProvider?.getGlobalConfig()?.theme, []);
  const [strokeColor, trailColor] = useMemo(() => {
    return theme === 'dark' ? ['#0996EE', '#303030'] : ['#B8E1FF', '#CDCDCD'];
  }, [theme]);

  return (
    <Progress
      {...props}
      className="portkey-ui-progress-line"
      showInfo={false}
      strokeColor={strokeColor}
      trailColor={trailColor}
    />
  );
}
