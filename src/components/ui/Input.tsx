import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className = '',
  autoComplete,
  name,
  onBlur,
  togglePassword = false,
}) => {
  const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const showToggle = togglePassword && isPasswordField;
  const effectiveType = showToggle && showPassword ? 'text' : type;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-charcoal mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          name={name}
          onBlur={onBlur}
          className={`
            w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            transition-colors duration-300
            ${showToggle ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            disabled={disabled}
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
