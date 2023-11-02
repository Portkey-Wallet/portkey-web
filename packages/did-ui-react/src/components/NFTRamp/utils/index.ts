export const showMax15Chars = (text?: string) => {
  if (!text || text.length < 15) return text;
  return text.slice(0, 15) + '......';
};
