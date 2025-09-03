import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner component for showing loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {string} props.message - Optional loading message
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message, 
  className = '' 
}) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  return (
    <div className={`loading-spinner loading-spinner--${size} ${className}`}>
      <Loader2 
        size={spinnerSize} 
        className="loading-spinner__icon" 
      />
      {message && (
        <span className="loading-spinner__message">
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;

