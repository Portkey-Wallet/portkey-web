import React from 'react';

export default function BaseStyleProvider({ children }: { children: React.ReactNode }) {
  return <div className="portkey-ui-wrapper">{children}</div>;
}
