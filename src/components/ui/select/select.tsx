import React, { useState, useRef, useEffect } from 'react';
import styles from './select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  width?: string | number;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Выберите...',
  onChange,
  className = '',
  width = '100%',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Находим выбранный элемент
  useEffect(() => {
    if (value) {
      const selected = options.find(opt => opt.value === value);
      setSelectedLabel(selected?.label || '');
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  // Закрываем список при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: SelectOption) => {
    setSelectedLabel(option.label);
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div 
      ref={wrapperRef}
      className={`${styles.selectWrapper} ${className}`}
      style={{ width }}
    >
      <div 
        className={`${styles.selectHeader} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`}
        onClick={handleToggle}
      >
        <span className={selectedLabel ? styles.selectedText : styles.placeholder}>
          {selectedLabel || placeholder}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
          ▼
        </span>
      </div>

      {isOpen && !disabled && (
        <ul className={styles.optionsList}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.optionItem} ${value === option.value ? styles.selected : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};