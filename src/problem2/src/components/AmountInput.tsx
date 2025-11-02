import { useState, useEffect } from 'react';
import styles from '../styles/AmountInput.module.css';

interface AmountInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
}

export function AmountInput({
  label,
  value,
  onChange,
  onFocus,
  disabled = false,
  error = null,
  placeholder = '0.00',
}: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '' || inputValue === '.') {
      onChange(inputValue);
      return;
    }

    const regex = /^\d*\.?\d*$/;
    if (regex.test(inputValue)) {
      onChange(inputValue);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={label}>
        {label}
      </label>
      <div className={`${styles.inputWrapper} ${error ? styles.error : ''} ${isFocused ? styles.focused : ''}`}>
        <input
          id={label}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={styles.input}
        />
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}

