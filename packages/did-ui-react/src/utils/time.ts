import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);

export function ensureMilliseconds(timestamp: string | number) {
  if (typeof timestamp === 'number') timestamp = timestamp.toString();
  const trimmedTimestamp = timestamp.trim();

  // Missing digits are filled with 0
  if (trimmedTimestamp.length < 13) return Number(trimmedTimestamp + '0'.repeat(13 - trimmedTimestamp.length));

  return Number(trimmedTimestamp);
}

export function dateToDayjs(date?: dayjs.ConfigType) {
  if (dayjs.isDayjs(date)) return date;
  const numDate = Number(date);
  if (!isNaN(numDate)) date = ensureMilliseconds(numDate);
  return dayjs(date);
}

export function isSameDay(date1: dayjs.ConfigType, date2: dayjs.ConfigType) {
  return dateToDayjs(date1).isSame(dateToDayjs(date2), 'day');
}

export const formatActivityTimeRevamp = (date?: dayjs.ConfigType): string => {
  if (!date) return '';
  const activityTimeTime = dateToDayjs(date);
  const now = dayjs();
  const inputDate = dayjs(date);
  const currentYear = dayjs().year();
  const dateYear = inputDate.year();
  if (activityTimeTime.isSame(now, 'day')) return 'Today';
  if (currentYear === dateYear) {
    return inputDate.format('MMM D');
  } else {
    return inputDate.format('MMM D, YYYY');
  }
};

export const formatTimeDifference = (epochTime: number) => {
  const now = dayjs();
  const pastTime = dayjs.unix(epochTime);

  const differenceInMinutes = now.diff(pastTime, 'minute');
  const differenceInHours = now.diff(pastTime, 'hour');
  const differenceInDays = now.diff(pastTime, 'day');

  if (differenceInMinutes < 1) {
    return '1 minute ago';
  } else if (differenceInMinutes < 60) {
    return `${differenceInMinutes} minute${differenceInMinutes > 1 ? 's' : ''} ago`;
  } else if (differenceInHours < 24) {
    return `${differenceInHours} hour${differenceInHours > 1 ? 's' : ''} ago`;
  } else {
    return `${differenceInDays} day${differenceInDays > 1 ? 's' : ''} ago`;
  }
};
