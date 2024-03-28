export const sliceCryptoStr = (data: string, padding = 117): Array<string> => {
  const count = data.length;
  const num = Math.floor(count / padding);
  const remainder = count % padding;
  const strList: Array<string> = [];
  for (let i = 0; i < num; i++) {
    const value = data.slice(i * padding, i * padding + padding);
    strList.push(value);
  }
  if (remainder !== 0) {
    const value = data.slice(-remainder);
    strList.push(value);
  }
  return strList;
};
