const variants = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm',
  secondary:
    'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
  ghost:
    'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  danger:
    'bg-white text-red-600 border border-red-200 hover:bg-red-50',
};

const sizes = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
