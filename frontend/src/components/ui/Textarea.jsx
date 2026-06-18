const Textarea = ({ label, id, error, className = '', ...props }) => {
  const textareaId = id || props.name;

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`min-h-24 w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 ${
          error ? 'border-red-300' : 'border-zinc-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;
