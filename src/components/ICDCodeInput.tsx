
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface ICDCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ICDCodeInput: React.FC<ICDCodeInputProps> = ({ value, onChange, placeholder = "Enter ICD code", className }) => {
  const validateICDFormat = (code: string) => {
    // Basic ICD-10 validation pattern: Letter followed by 1-2 digits, optional dot, and optional more digits
    const icdPattern = /^[A-Z]\d{1,2}(\.\d{1,3})?$/;
    return icdPattern.test(code);
  };
  
  const [isValid, setIsValid] = useState(true);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
    
    if (newValue && !validateICDFormat(newValue)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };
  
  return (
    <div>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
      {!isValid && (
        <p className="text-sm text-red-500 mt-1">
          ICD code should follow format: Letter followed by 1-2 digits, optional dot and more digits (e.g., A10, B01.1)
        </p>
      )}
    </div>
  );
};

export default ICDCodeInput;
