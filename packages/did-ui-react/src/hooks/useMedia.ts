/**
 * Fork react-use `useMedia`
 */
import { useEffect, useState } from 'react';
import { isBrowser } from '../utils';

const getInitialState = (query: string, defaultState?: boolean) => {
  // Prevent a React hydration mismatch when a default value is provided by not defaulting to window.matchMedia(query).matches.
  if (defaultState !== undefined) {
    return defaultState;
  }

  if (isBrowser) {
    return window.matchMedia(query).matches;
  }

  // A default value has not been provided, and you are rendering on the server, warn of a possible hydration mismatch when defaulting to false.
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '`useMedia` When server side rendering, defaultState should be defined to prevent a hydration mismatches.',
    );
  }

  return false;
};

const useMedia = (query: string, defaultState?: boolean) => {
  const [state, setState] = useState(getInitialState(query, defaultState));

  useEffect(() => {
    let mounted = true;
    if (!isBrowser) return;
    const mql = window.matchMedia(query);
    const onChange = () => {
      if (!mounted) {
        return;
      }
      setState(!!mql.matches);
    };

    mql.addEventListener('change', onChange);
    setState(mql.matches);

    return () => {
      mounted = false;
      mql.removeEventListener('change', onChange);
    };
  }, [query]);

  return state;
};
export const useResponsiveScreenType = () => {
  const isSmallScreen = useMedia('(max-width: 600px)');
  const isMediumScreen = useMedia('(min-width: 601px) and (max-width: 896px)');
  const isLargeScreen = useMedia('(min-width: 897px)');

  if (isSmallScreen) return 'small';
  if (isMediumScreen) return 'medium';
  if (isLargeScreen) return 'large';

  return 'unknown';
};

export default useMedia;
