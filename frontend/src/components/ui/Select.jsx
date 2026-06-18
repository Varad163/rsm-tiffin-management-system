const Select = ({ label, id, error, options = [], placeholder = 'Select...', className = '', ...props }) => {
  const selectId = id || props.name;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-zinc-900 transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 ${
          error ? 'border-red-300' : 'border-zinc-200'
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
