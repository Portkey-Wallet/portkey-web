import { usePortkey } from '../context';
import ThrottleButton from '../ThrottleButton';
import CustomSvg from '../CustomSvg';
import svgsList from '../../assets/svgs';
import './index.less';

interface ICircleLoginButton {
  onClickCallback: () => void;
  iconType: keyof typeof svgsList;
  key?: string;
  className?: string;
}

interface IBlockLoginButton extends ICircleLoginButton {
  iconName: string;
}
const BlockLoginButton = ({ onClickCallback, iconType, iconName, key }: IBlockLoginButton) => {
  const [{ theme }] = usePortkey();
  return (
    <ThrottleButton className="login-block-btn" onClick={onClickCallback} key={key}>
      <CustomSvg type={iconType} fillColor={theme === 'light' ? '#1F1F21' : '#FFFFFF'} />
      <span>{`Continue with ${iconName}`}</span>
      <span className="empty"></span>
    </ThrottleButton>
  );
};

const CircleLoginButton = ({ onClickCallback, iconType, key }: ICircleLoginButton) => {
  const [{ theme }] = usePortkey();
  return (
    <div className="login-circle-btn" key={key} onClick={onClickCallback}>
      <CustomSvg type={iconType} fillColor={theme === 'light' ? '#1F1F21' : '#FFFFFF'} />
    </div>
  );
};

export { BlockLoginButton, CircleLoginButton };
