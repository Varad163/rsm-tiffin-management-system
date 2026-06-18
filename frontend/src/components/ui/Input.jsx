const Input = ({
  label,
  id,
  error,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-zinc-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
