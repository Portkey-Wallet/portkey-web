import { useMemo } from 'react';
import { useResponsiveScreenType } from './useMedia';

const PAGE_SIZE_IN_NFT_ITEM_MAX_SCREEN = 14;
const PAGE_SIZE_IN_NFT_ITEM_MIDDLE_SCREEN = 11;
const PAGE_SIZE_IN_NFT_MIN_ITEM = 8;

const useNFTMaxCount = () => {
  // const isWide = useMedia('(max-width: 768px)');
  return PAGE_SIZE_IN_NFT_ITEM_MAX_SCREEN;
  // const screenType = useResponsiveScreenType();
  // return useMemo(() => {
  //   if (screenType === 'small') {
  //     return PAGE_SIZE_IN_NFT_MIN_ITEM;
  //   }
  //   if (screenType === 'medium') {
  //     return PAGE_SIZE_IN_NFT_ITEM_MIDDLE_SCREEN;
  //   }
  //   return PAGE_SIZE_IN_NFT_ITEM_MAX_SCREEN;
  // }, [screenType]);
};

export default useNFTMaxCount;
