import TitleWrapper from '../TitleWrapper';
import CustomSvg from '../CustomSvg';

export default function ReceiveCard({ onBack }: { onBack?: () => void }) {
  return (
    <div>
      <TitleWrapper leftElement={<CustomSvg type="LeftArrow" onClick={onBack} />} />
    </div>
  );
}
