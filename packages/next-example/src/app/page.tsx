'use client';
import { Button } from 'antd';

export default function Home() {
  return (
    <>
      <a href="example">
        <Button type="primary">Go to example</Button>
      </a>
      <div></div>
      <a href="sign">
        <Button type="primary">Go to sign</Button>
      </a>
      <div></div>
      <a href="assets">
        <Button type="primary">Go to assets</Button>
      </a>
      <a href="guardians">
        <Button>Go to guardians</Button>
      </a>
      <div></div>
      <a href="utils-test">
        <Button type="primary">Go to utils-test</Button>
      </a>
    </>
  );
}
