import React, { useRef, useState, useLayoutEffect } from 'react';
import './index.less';
import { ErrorType } from '../Ramp/types';
// import { ErrorType } from '../../../../../../../types';

interface AutoWidthInputProps {
  placeholder?: string;
  onAmountInput?: (value: string) => void;
  amount?: string;
  amountError?: ErrorType;
  textInputRef: React.RefObject<HTMLInputElement>;
}

const AutoWidthInput: React.FC<AutoWidthInputProps> = ({
  placeholder,
  onAmountInput,
  amount,
  amountError,
  textInputRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [inputWidth, setInputWidth] = useState('auto');

  const measureTextWidth = (text: string) => {
    const context = canvasRef.current.getContext('2d');
    if (context && textInputRef?.current) {
      const style = window.getComputedStyle(textInputRef.current);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const letterSpacing = parseFloat(style.letterSpacing || '0');
      let textWidth = 0;
      for (const char of text) {
        textWidth += context.measureText(char).width + letterSpacing;
      }
      // const textWidth = context.measureText(text).width;
      const paddingLeft = parseFloat(style.paddingLeft || '0');
      const paddingRight = parseFloat(style.paddingRight || '0');
      const borderLeftWidth = parseFloat(style.borderLeftWidth || '0');
      const borderRightWidth = parseFloat(style.borderRightWidth || '0');
      return textWidth + paddingLeft + paddingRight + borderLeftWidth + borderRightWidth;
    }
    return 0;
  };

  useLayoutEffect(() => {
    const text = amount || placeholder || '';
    const width = measureTextWidth(text);
    setInputWidth(`${width}px`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, placeholder]);

  return (
    <div className="auto-width-input-wrapper">
      <input
        ref={textInputRef}
        type="text"
        placeholder={placeholder}
        value={amount}
        onChange={(e) => onAmountInput?.(e.target.value)}
        style={{ width: inputWidth, paddingLeft: 0, paddingRight: 0 }}
        className={`fiatInput input-style ${amountError?.isError ? 'amountErrorText' : ''}`}
      />
    </div>
  );
};

export default AutoWidthInput;
