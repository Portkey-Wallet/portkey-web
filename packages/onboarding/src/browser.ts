const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

export const semverCompare = (verionA: string, versionB: string): -1 | 0 | 1 => {
  const { isNaN } = window;
  const splitA = verionA.split('.');
  const splitB = versionB.split('.');

  for (let i = 0; i < 3; i++) {
    const snippetA = Number(splitA[i]);
    const snippetB = Number(splitB[i]);

    if (snippetA > snippetB) return 1;
    if (snippetB > snippetA) return -1;

    // e.g. '1.0.0-rc' -- Number('0-rc') = NaN
    if (!isNaN(snippetA) && isNaN(snippetB)) return 1;
    if (isNaN(snippetA) && !isNaN(snippetB)) return -1;
  }

  return 0;
};

export const getIOSVersion = () => {
  const version = ua
    .toLocaleLowerCase()
    .match(/cpu iphone os (.*?) like mac os/)?.[1]
    .split('_');
  if (!version) return -1;
  return Number.parseInt(version[0], 10);
};

export const isAndroid = /android/i.test(ua);

export const isIos = /iphone|ipad|ipod/i.test(ua);

export const isOriginalChrome =
  /chrome\/[\d.]+ mobile safari\/[\d.]+/i.test(ua) && isAndroid && ua.indexOf('Version') < 0;
