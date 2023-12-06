import { Button } from 'antd';
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <a href="example">
          <Button>Go to example</Button>
        </a>
        <div></div>
        <a href="sign">
          <Button>Go to sign</Button>
        </a>
        <div></div>
        <a href="assets">
          <Button>Go to assets</Button>
        </a>
        <div></div>
        <a href="utils-test">
          <Button>Go to utils-test</Button>
        </a>
      </div>
    </main>
  );
}
