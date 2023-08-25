import Bowser from 'bowser';

export const detectBrowserName = () => {
  if (typeof navigator === 'undefined') return '';
  const browserInfo = Bowser.parse(window.navigator.userAgent);
  if (browserInfo.browser.name === 'Firefox') {
    return 'FIREFOX';
  } else if (['Chrome', 'Chromium'].includes(browserInfo.browser.name || '')) {
    return 'CHROME';
  } else if (browserInfo.browser.name === 'Microsoft Edge') {
    return 'EDGE';
  }
  return browserInfo.browser.name || '';
};
