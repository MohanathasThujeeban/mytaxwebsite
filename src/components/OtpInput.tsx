import React, { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (otp: string[]) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, value, onChange }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const next = [...value];
        next[index] = '';
        onChange(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    onChange(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-input-group">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          className="otp-digit"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OtpInput;
