import { SeedTypeEnum } from '@portkey/types';
import './index.less';
import clsx from 'clsx';
import CustomSvg from '../../../CustomSvg';

export type TSeedBadgeProps = { className?: string; isSeed?: boolean; seedType?: SeedTypeEnum };

export default function SeedBadge({ className, isSeed, seedType }: TSeedBadgeProps) {
  return (
    <>
      {isSeed && seedType && (
        <div className={clsx('portkey-ui-seed-badge', className)}>
          <CustomSvg type={seedType === SeedTypeEnum.NFT ? 'SeedTypeNFT' : 'SeedTypeToken'} />
        </div>
      )}
    </>
  );
}
