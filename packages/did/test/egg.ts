import { sleep } from '@portkey/utils';

type CodeItem = {
  code: string;
  from: string;
  date: string;
};
const formatResponse = (response: string) => {
  try {
    return JSON.parse(response);
  } catch (e) {
    return response;
  }
};
export async function getCode(time: number, reCount = 0): Promise<CodeItem> {
  if (reCount > 8) throw new Error('timeout');
  const result = await fetch(`http://127.0.0.1:7300/api/imap/gteCode?time=${time}`);
  const text = await result.text();
  const res = formatResponse(text);
  if (res.data.code) {
    return res.data;
  }
  await sleep(5000);
  return getCode(time, ++reCount);
}
