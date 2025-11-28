export const checkTimeOver12 = (inputTime: string) => {
  const inputDate = new Date(inputTime);
  const currentDate = new Date();
  const diffInMilliseconds = currentDate.getTime() - inputDate.getTime();
  const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
  return diffInHours > 12;
};

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let seconds = date.getUTCSeconds();

  if (hours >= 24) {
    hours -= 24;
  }

  const monthStr = month < 10 ? `0${month}` : month;
  const dayStr = day < 10 ? `0${day}` : day;
  const hoursStr = hours < 10 ? `0${hours}` : hours;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${monthStr}/${dayStr}/${year} ${hoursStr}:${minutesStr}:${secondsStr} ${ampm} UTC`;
}
