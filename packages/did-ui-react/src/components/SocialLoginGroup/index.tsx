import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { ISocialLogin } from '../../types';
import { useRef, useState } from 'react';
import './index.less';
import { TotalAccountsInfo } from '../../constants/socialLogin';
import { SocialLoginList } from '../../constants/guardian';
import { useComputeIconCountPreRow } from '../../hooks/login';
import { CircleLoginButton } from '../LoginButton';

const MinIconGap = 18;

interface SocialLoginGroupProps {
  supportAccounts?: Array<ISocialLogin>;
  isShowScan?: boolean;
  className?: string;
  onAccountTypeChange?: (type: ISocialLogin) => void;
}

export default function SocialLoginGroup({
  supportAccounts = SocialLoginList as ISocialLogin[],
  className,
  onAccountTypeChange,
}: SocialLoginGroupProps) {
  // const ref = useRef<HTMLDivElement>(null);
  // const [isFold, setIsFold] = useState(true);

  // const { isNeedFold, iconRealGap, iconWidthPerRow, expendDisplayList, defaultDisplayList } =
  //   useComputeIconCountPreRow<ISocialLogin>({
  //     ref,
  //     accountList: supportAccounts,
  //     supportList: SocialLoginList as ISocialLogin[],
  //     minIconGap: MinIconGap,
  //   });

  return (
    // <div className={clsx('social-icon-group-wrapper', className)} ref={ref}>
    //   <div
    //     className="portkey-ui-flex-start-center account-type-list"
    //     style={{ columnGap: isNeedFold ? iconRealGap : MinIconGap, rowGap: MinIconGap }}>
    //     {defaultDisplayList.map((item) => (
    //       <CustomSvg
    //         className="portkey-ui-flex-center"
    //         style={{ width: iconWidthPerRow }}
    //         key={TotalAccountsInfo[item].type}
    //         type={TotalAccountsInfo[item].icon}
    //         onClick={() => onAccountTypeChange?.(TotalAccountsInfo[item].type as ISocialLogin)}
    //       />
    //     ))}

    //     {!isFold &&
    //       expendDisplayList.map((item) => (
    //         <CustomSvg
    //           className="portkey-ui-flex-center"
    //           style={{ width: iconWidthPerRow }}
    //           key={TotalAccountsInfo[item].type}
    //           type={TotalAccountsInfo[item].icon}
    //           onClick={() => onAccountTypeChange?.(TotalAccountsInfo[item].type as ISocialLogin)}
    //         />
    //       ))}

    //     {isNeedFold && (
    //       <CustomSvg
    //         className={clsx('portkey-ui-flex-center', !isFold && 'expand-account')}
    //         style={{ width: iconWidthPerRow }}
    //         type={'ArrowDown'}
    //         onClick={() => setIsFold(!isFold)}
    //       />
    //     )}
    //   </div>
    // </div>
    <>
      {supportAccounts.map((item) => {
        return (
          <CircleLoginButton
            key={item}
            iconType={TotalAccountsInfo[item].icon}
            onClickCallback={() => onAccountTypeChange?.(item)}
          />
        );
      })}
    </>
  );
}
