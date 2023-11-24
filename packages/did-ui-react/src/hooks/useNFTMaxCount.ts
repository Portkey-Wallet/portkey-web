import { useMemo } from 'react';
import useMedia from './useMedia';

const PAGE_SIZE_IN_NFT_ITEM_MAX_SCREEN = 6;
const PAGE_SIZE_IN_NFT_ITEM = 9;

const useNFTMaxCount = () => {
  const isWide = useMedia('(max-width: 768px)');

  return useMemo(() => (!isWide ? PAGE_SIZE_IN_NFT_ITEM_MAX_SCREEN : PAGE_SIZE_IN_NFT_ITEM), [isWide]);
};

export default useNFTMaxCount;
