import Card from './Card';

const StatCard = ({ label, value, hint, className = '' }) => {
  return (
    <Card padding="sm" className={className}>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-zinc-400">{hint}</p>}
    </Card>
  );
};

export default StatCard;
