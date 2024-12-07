import { Progress, ProgressProps } from 'antd';
import './index.less';

export type ProgressLineType = {
  percent: number;
} & ProgressProps;

export default function ProgressLine(props: ProgressLineType) {
  return (
    <Progress
      {...props}
      className="portkey-ui-progress-line"
      showInfo={false}
      strokeColor="#0996EE"
      trailColor="#303030"
    />
  );
}
