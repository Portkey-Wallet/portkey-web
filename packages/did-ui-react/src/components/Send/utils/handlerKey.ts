export function handleKeyDown(e: { key: string; preventDefault: () => any }) {
  const allow = [
    ...Array(10)
      .fill('')
      .map((_v, i) => i.toString()),
    ' .',
    '.',
    'Backspace',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
  ];
  if (!allow.includes(e.key)) {
    e.preventDefault();
  }
}
export function handleKeyDownInt(e: { key: string; preventDefault: () => any }) {
  const allow = [
    ...Array(10)
      .fill('')
      .map((_v, i) => i.toString()),
    'Backspace',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
  ];
  if (!allow.includes(e.key)) {
    e.preventDefault();
  }
}

export const handleDecimalInput = (event: any, decimals: number | string) => {
  const value = event.target?.value.trim();
  const oldValue = value.slice(0, value.length - 1);
  const commaCount = value.match(/\./gim)?.length;

  // CHECK1: comma count
  if (commaCount > 1) return (event.target.value = oldValue);

  // CHECK2: decimal count
  const valueList = value.split('.');
  if (valueList[1]?.length > 0 && Number(valueList[1]?.length) > Number(decimals))
    return (event.target.value = oldValue);

  event.target.value = value;
};
