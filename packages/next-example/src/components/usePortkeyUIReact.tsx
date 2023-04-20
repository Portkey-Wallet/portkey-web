import { useEffect, useState } from 'react';

export default function usePortkeyUIReact() {
  const [portkeyUI, setPortkeyUI] = useState<typeof import('@portkey/did-ui-react')>();

  useEffect(() => {
    import('@portkey/did-ui-react').then(setPortkeyUI);
  }, []);
  return portkeyUI;
}
