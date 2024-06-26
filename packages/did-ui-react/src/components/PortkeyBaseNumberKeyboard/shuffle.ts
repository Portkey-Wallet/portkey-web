export function shuffle(array: any[]) {
  const result = [...array];
  for (let i = result.length; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i - 1], result[j]] = [result[j], result[i - 1]];
  }
  return result;
}
