const Card = ({ children, className = '', padding = 'default' }) => {
  const paddingClasses = {
    none: '',
    sm: 'p-5',
    default: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, className = '' }) => (
  <div className={`mb-8 space-y-2 ${className}`}>
    {title && (
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        {title}
      </h2>
    )}
    {subtitle && <p className="text-sm text-zinc-500 sm:text-base">{subtitle}</p>}
  </div>
);

export default Card;
