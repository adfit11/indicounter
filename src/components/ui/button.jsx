export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-3 py-1.5 rounded bg-blue-300 text-white hover:bg-blue-600 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}