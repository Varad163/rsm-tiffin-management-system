const statusStyles = {
  PENDING: 'bg-zinc-100 text-zinc-700',
  CONFIRMED: 'bg-zinc-900 text-white',
  CANCELLED: 'bg-zinc-200 text-zinc-600',
  DELIVERED: 'border border-zinc-900 text-zinc-900',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
      statusStyles[status] || 'bg-zinc-100 text-zinc-700'
    }`}
  >
    {status}
  </span>
);

export default StatusBadge;
