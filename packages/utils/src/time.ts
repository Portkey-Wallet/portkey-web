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
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = date.getUTCDate();
  let hours = date.getUTCHours() + 2;
  let minutes = date.getUTCMinutes();

  if (hours >= 24) {
    hours -= 24;
  }

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${month} ${day}, ${year}, at ${hours}:${minutesStr}`;
}
