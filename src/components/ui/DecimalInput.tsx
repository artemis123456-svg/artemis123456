import React, { useState, useEffect } from 'react';
import { Input } from './input';

interface DecimalInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: number;
  onChange: (val: number) => void;
}

export function DecimalInput({ value, onChange, ...props }: DecimalInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    // Sync with parent value if it changed externally or is different from parsed displayValue
    const parsed = parseFloat(displayValue.replace(',', '.')) || 0;
    if (parsed !== value || displayValue === '') {
      setDisplayValue(value === 0 ? '' : value.toString().replace('.', ','));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty, negative sign, only digits, commas, dots, and optional trailing decimal digits
    if (raw === '' || raw === '-' || /^-?[0-9]*[.,]?[0-9]*$/.test(raw)) {
      setDisplayValue(raw);
      let parsed = parseFloat(raw.replace(',', '.')) || 0;
      // Handle lone minus sign without updating to 0 immediately if they are typing
      if (raw === '-') {
        parsed = 0;
      }
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // Standardize representation on blur
    const parsed = parseFloat(displayValue.replace(',', '.')) || 0;
    setDisplayValue(parsed === 0 ? '0' : parsed.toString().replace('.', ','));
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
