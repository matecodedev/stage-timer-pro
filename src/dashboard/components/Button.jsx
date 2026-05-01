export function Button({ children, onClick, className = '', variant = 'default' }) {
  const baseClasses = 'px-3 py-2 rounded border shadow-sm hover:opacity-90 transition-all';
  const variants = {
    default:
      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
    primary: 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600',
    success: 'bg-green-500 text-white border-green-500 hover:bg-green-600',
    warning: 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600',
    danger: 'bg-red-500 text-white border-red-500 hover:bg-red-600',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
