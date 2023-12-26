import { useEffect, useState } from 'react';

export default function usePortkeyUIReact() {
  const [portkeyUI, setPortkeyUI] = useState<typeof import('@portkey-v1/did-ui-react')>();

  useEffect(() => {
    import('@portkey-v1/did-ui-react').then(setPortkeyUI);
  }, []);
  return portkeyUI;
}
