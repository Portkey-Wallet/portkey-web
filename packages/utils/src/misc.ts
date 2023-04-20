export const sleep = (time: number) => {
  return new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, time);
  });
};
