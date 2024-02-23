import { ICountryItem } from '../types';

export const getCountryCodeJSON = (countryCode: ICountryItem[]) => {
  const country: { [x: string]: ICountryItem[] } = {};
  countryCode.forEach((item) => {
    const first = item.country[0];
    if (country[first]) country[first].push(item);
    else country[first] = [item];
  });
  return country;
};

export const getCountryCodeIndex = (countryCode: ICountryItem[]) => {
  return Object.entries(getCountryCodeJSON(countryCode));
};

export const countryCodeFilter = (filterFelid: string, countryCodeList: ICountryItem[]) => {
  if (!filterFelid) return countryCodeList;
  filterFelid = filterFelid.toLocaleLowerCase();
  if (/\d/.test(filterFelid)) {
    // all numbers
    const numStr = filterFelid.match(/\d+/g)?.join('').trim();
    // all non-numeric
    const str = filterFelid
      .match(/[^0-9]/g)
      ?.join('')
      .trim();
    const list: ICountryItem[] = [];
    if (numStr) {
      list.push(...countryCodeList.filter((country) => country.code.includes(numStr)));
    }
    if (str) {
      list.push(...countryCodeList.filter((country) => country.country.toLocaleLowerCase().includes(str)));
    }
    return Array.from(new Set(list));
  } else {
    return countryCodeList.filter((country) => country.country.toLocaleLowerCase().includes(filterFelid));
  }
};

export const DefaultCountry = { country: 'Singapore', code: '65', iso: 'SG' };
