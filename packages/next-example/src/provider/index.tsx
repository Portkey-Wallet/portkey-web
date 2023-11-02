import { ReactNode } from 'react';
import Portkey from './Portkey';

export default function Provider({ children }: { children: ReactNode }) {
  return <Portkey>{children}</Portkey>;
}
