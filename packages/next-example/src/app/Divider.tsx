import React from 'react';
export default function Divider(props: { gap: number }) {
  const { gap } = props;
  return <div style={{ height: `${gap}px` }}></div>;
}
