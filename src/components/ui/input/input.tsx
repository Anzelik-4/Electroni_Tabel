import React, { useState, FocusEvent, ChangeEvent } from 'react';
import styles from './Input.module.scss';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  name?: string;
  className?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  placeholder = '',
  value: externalValue,
  onChange,
  type = 'text',
  name = '',
  className = '',
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);

  // Используем внешнее значение если оно передано, иначе внутреннее
  const currentValue = externalValue !== undefined ? externalValue : internalValue;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (externalValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      <input
        type={type}
        name={name}
        value={currentValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${isActive ? styles.active : ''}`}
      />
    </div>
  );
};